const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const studentEmail = 'test@example.com';
  const studentId = 'some-student-id';
  try {
    console.log('Running enrollments query...');
    const enrollmentsRaw = await prisma.enrollment.findMany({
      where: { email: studentEmail },
      orderBy: { createdAt: 'desc' },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            categorie: true,
            imageUrl: true,
            description: true,
          },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
            format: true,
            status: true,
            prerequisites: true,
            maxParticipants: true,
            currentParticipants: true,
          },
        },
      },
    });
    console.log('✅ Enrollments:', enrollmentsRaw.length);

    console.log('Running studentSubmissions query...');
    const submissions = await prisma.studentSubmission.findMany({
      where: { studentId: studentId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('✅ StudentSubmissions:', submissions.length);

    console.log('Running studentCertificate query...');
    const portalCertificates = await prisma.studentCertificate.findMany({
      where: { studentId: studentId },
      orderBy: { createdAt: 'desc' },
    });
    console.log('✅ StudentCertificates:', portalCertificates.length);

    console.log('Running certificate query...');
    const issuedCertificates = await prisma.certificate.findMany({
      where: {
        enrollment: {
          is: {
            email: studentEmail,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            categorie: true,
          },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
      },
    });
    console.log('✅ Certificates:', issuedCertificates.length);

    console.log('Running news query...');
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    console.log('✅ News:', news.length);

    console.log('Running evaluations query...');
    const evaluations = await prisma.evaluation.findMany({
      where: {
        enrollment: {
          is: {
            email: studentEmail,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      include: {
        formation: {
          select: {
            title: true,
          },
        },
        session: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            location: true,
            format: true,
          },
        },
      },
    });
    console.log('✅ Evaluations:', evaluations.length);

    console.log('Running user profile query...');
    const userProfile = await prisma.user.findUnique({
      where: { email: studentEmail },
      select: {
        image: true,
      },
    });
    console.log('✅ UserProfile:', userProfile);

    const formationIds = [1, 2];
    const sessionIds = [1, 2];

    console.log('Running assignments query...');
    const assignmentsRaw = await prisma.assignment.findMany({
      where: {
        formationId: { in: formationIds },
        OR: [
          { sessionId: null },
          { sessionId: { in: sessionIds } }
        ],
        status: 'publie',
        publishDate: { lte: new Date() }
      },
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            categorie: true,
          }
        },
        files: true,
        submissions: {
          where: {
            studentEmail: { equals: studentEmail, mode: 'insensitive' },
          },
          include: {
            files: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
      orderBy: { deadline: 'asc' },
    });
    console.log('✅ Assignments:', assignmentsRaw.length);

  } catch (err) {
    console.error('❌ Query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
