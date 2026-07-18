const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollmentId = 1; // Let's try enrollment ID 1 or find any enrollment
  const enrollment = await prisma.enrollment.findFirst({
    include: {
      formation: true,
      session: true,
    }
  });

  if (!enrollment) {
    console.log('No enrollments found in database.');
    return;
  }

  console.log('Testing update on enrollment:', enrollment.id);
  const status = 'confirmed'; // or 'accepted'
  const reason = 'Test reason';
  const notes = 'Test notes';

  try {
    // 1. Try to query email template
    console.log('Querying email template for status:', status);
    const template = await prisma.emailTemplate.findUnique({ where: { id: status } });
    console.log('Template:', template);

    // 2. Try to render or send email (simulate)
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
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || variables[key.toLowerCase()] || '');
    };

    let emailSubject = `Suivi de votre inscription - ${enrollment.formation.title}`;
    let emailBody = `Bonjour ${variables.Nom_etudiant},\n\nLe statut de votre inscription a changé pour : ${status}.`;

    if (template) {
      emailSubject = replaceVars(template.subject);
      emailBody = replaceVars(template.body);
    }

    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    // 3. Try to log audit log
    console.log('Creating admin audit log...');
    const auditLog = await prisma.adminAuditLog.create({
      data: {
        adminId: 'test-admin-id',
        adminUsername: 'test-admin',
        action: `change_enrollment_status:${status}`,
        targetType: 'Enrollment',
        targetId: String(enrollment.id),
        targetLabel: `${enrollment.firstName} ${enrollment.lastName}`,
        summary: `Statut modifié de ${enrollment.status} à ${status}. Email envoyé: false`,
        metadata: { reason, emailSent: false }
      }
    });
    console.log('Audit log created:', auditLog.id);

    // 4. Try to update enrollment
    console.log('Updating enrollment...');
    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status,
      },
    });
    console.log('Enrollment updated successfully:', updated.id, 'status:', updated.status);

  } catch (err) {
    console.error('CRITICAL TRANSACTION ERROR:', err);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
