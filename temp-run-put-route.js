const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const enrollmentId = 22;
  const status = 'accepted'; // accepted is a valid template ID
  const reason = 'Félicitations, votre inscription a été validée.';
  const adminId = 'some-admin-id';
  const adminUsername = 'testadmin';

  let enrollment = null;
  let retries = 5;
  while (retries > 0) {
    try {
      console.log(`Fetching enrollment in test script... (${retries} attempts left)`);
      enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          formation: true,
          session: true,
        },
      });
      break;
    } catch (e) {
      console.error('Fetch enrollment connection failed:', e.message);
      retries--;
      if (retries === 0) throw e;
      await delay(2000);
    }
  }

  if (!enrollment) {
    console.log('Enrollment 22 not found.');
    return;
  }

  console.log('Parsing notes...');
  function parseNotes(notesStr) {
    if (!notesStr) return { answers: {}, formType: null, adminComment: '', history: [] }
    try {
      const parsed = typeof notesStr === 'string' && notesStr.startsWith('{') ? JSON.parse(notesStr) : null
      if (parsed) {
        return {
          answers: parsed.answers || {},
          formType: parsed.formType || null,
          adminComment: parsed.adminComment !== undefined ? parsed.adminComment : '',
          history: Array.isArray(parsed.history) ? parsed.history : []
        }
      }
    } catch (err) {
      console.error("Notes parse error:", err)
    }
    return { answers: {}, formType: null, adminComment: notesStr || '', history: [] }
  }

  const notesObj = parseNotes(enrollment.notes);
  let updatedNotes = enrollment.notes || '';
  let emailSent = false;

  console.log('Loading email template for status:', status);
  let template = null;
  retries = 5;
  while (retries > 0) {
    try {
      template = await prisma.emailTemplate.findUnique({ where: { id: status } });
      break;
    } catch (e) {
      console.error('Fetch template connection failed:', e.message);
      retries--;
      if (retries === 0) throw e;
      await delay(2000);
    }
  }
  console.log('Found template in DB:', template ? 'YES' : 'NO');

  const datesText = enrollment.session
    ? `${new Date(enrollment.session.startDate).toLocaleDateString('fr-FR')} au ${new Date(enrollment.session.endDate).toLocaleDateString('fr-FR')}`
    : new Date(enrollment.startDate).toLocaleDateString('fr-FR');

  const sessionMeta = enrollment.session
    ? (enrollment.session.prerequisites?.startsWith('{')
        ? JSON.parse(enrollment.session.prerequisites)
        : null)
    : null;
  const sessionTitle = sessionMeta?.customTitle || (enrollment.session ? `#${enrollment.session.id}` : `#${enrollment.sessionId || ''}`);
  
  const variables = {
    Nom_etudiant: `${enrollment.firstName} ${enrollment.lastName}`,
    Formation: enrollment.formation.title,
    Session: sessionTitle,
    Dates: datesText,
    Lieu: enrollment.session?.location || 'À distance',
    Coordonnees_contact: process.env.CONTACT_EMAIL || 'contact@cjdevelopmenttc.org',
    Signature: 'CJ Development Training Center',
    Justification: reason || "Aucune justification fournie."
  };

  const replaceVars = (text) => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || variables[key.toLowerCase()] || '')
  };

  let emailSubject = `Suivi de votre inscription - ${enrollment.formation.title}`;
  let emailBody = `Bonjour ${variables.Nom_etudiant},\n\nLe statut de votre inscription a changé pour : ${status}.`;

  if (template) {
    emailSubject = replaceVars(template.subject);
    emailBody = replaceVars(template.body);
  }

  console.log('Importing email utilities...');
  const { sendEmail, renderBrandedEmailLayout } = require('./lib/email.ts');
  
  const eyebrowLabel = ({
    accepted: 'Admission',
    rejected: 'Candidature',
    waitlist: 'Liste d\'attente',
    cancelled: 'Annulation'
  })[status] || 'Suivi Inscription';

  console.log('Rendering branded email layout...');
  const htmlContent = renderBrandedEmailLayout({
    eyebrow: eyebrowLabel,
    title: emailSubject,
    introHtml: emailBody.replace(/\n/g, '<br />'),
    bodyHtml: ''
  });

  console.log('Sending email...');
  try {
    await sendEmail({
      to: enrollment.email,
      subject: emailSubject,
      html: htmlContent,
      text: emailBody
    });
    emailSent = true;
    console.log('Email sent successfully.');
  } catch (err) {
    console.error("Erreur lors de l'envoi de l'email de notification :", err);
  }

  console.log('Creating AdminAuditLog...');
  retries = 5;
  while (retries > 0) {
    try {
      await prisma.adminAuditLog.create({
        data: {
          adminId: adminId,
          adminUsername: adminUsername,
          action: `change_enrollment_status:${status}`,
          targetType: 'Enrollment',
          targetId: String(enrollmentId),
          targetLabel: `${enrollment.firstName} ${enrollment.lastName}`,
          summary: `Statut modifié de ${enrollment.status} à ${status}. Email envoyé: ${emailSent}`,
          metadata: { reason, emailSent }
        }
      });
      break;
    } catch (e) {
      console.error('Create AuditLog connection failed:', e.message);
      retries--;
      if (retries === 0) throw e;
      await delay(2000);
    }
  }
  console.log('Created AuditLog.');

  console.log('Updating enrollment in database...');
  retries = 5;
  let updated = null;
  while (retries > 0) {
    try {
      updated = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status,
          notes: updatedNotes,
        },
      });
      break;
    } catch (e) {
      console.error('Update enrollment connection failed:', e.message);
      retries--;
      if (retries === 0) throw e;
      await delay(2000);
    }
  }
  console.log('Enrollment updated successfully. New status:', updated.status);
}

main()
  .catch(e => console.error('CRITICAL UNCAUGHT ERROR:', e))
  .finally(() => prisma.$disconnect());
