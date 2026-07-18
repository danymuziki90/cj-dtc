const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enrollment = await prisma.enrollment.findFirst({
    include: {
      formation: true,
      session: true
    }
  });

  if (!enrollment) {
    console.log('No enrollment found in database.');
    return;
  }

  console.log('Found enrollment ID:', enrollment.id, 'status:', enrollment.status);

  try {
    const status = 'confirmed';
    const reason = 'Test reason';
    const emailSent = false;
    const adminUsername = 'testadmin';
    const adminId = 'some-admin-id';

    // Log in AdminAuditLog
    console.log('Creating AdminAuditLog...');
    const audit = await prisma.adminAuditLog.create({
      data: {
        adminId: adminId,
        adminUsername: adminUsername,
        action: `change_enrollment_status:${status}`,
        targetType: 'Enrollment',
        targetId: String(enrollment.id),
        targetLabel: `${enrollment.firstName} ${enrollment.lastName}`,
        summary: `Statut modifié de ${enrollment.status} à ${status}. Email envoyé: ${emailSent}`,
        metadata: { reason, emailSent }
      }
    });
    console.log('Created AuditLog successfully:', audit.id);

    console.log('Updating enrollment in DB...');
    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: status,
      },
      include: { formation: true, session: true },
    });
    console.log('Updated enrollment successfully. New status:', updated.status);

  } catch (err) {
    console.error('CRITICAL ERROR DURING DB LOGIC:', err);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
