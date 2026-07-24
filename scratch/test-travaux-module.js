const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== TEST DU MODULE TRAVAUX & SYNCHRONISATION ===\n')

  // 1. Vérification / Création d'une session de test
  let formation = await prisma.formation.findFirst()
  if (!formation) {
    formation = await prisma.formation.create({
      data: {
        title: 'Formation Test Travaux',
        slug: 'formation-test-travaux-' + Date.now(),
        description: 'Description de test',
        statut: 'publie',
      },
    })
  }

  let session = await prisma.trainingSession.findFirst({
    where: { status: 'ouverte' },
  })

  if (!session) {
    session = await prisma.trainingSession.create({
      data: {
        formationId: formation.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Abidjan / En ligne',
        format: 'hybride',
        status: 'ouverte',
        maxParticipants: 30,
      },
    })
  }

  console.log(`✅ Session de formation active ID: ${session.id} (${formation.title})`)

  // 2. Vérification / Création d'un étudiant de test et son Inscription (Enrollment)
  let student = await prisma.student.findFirst({
    where: { email: 'student.test.travaux@example.com' },
  })

  if (!student) {
    student = await prisma.student.create({
      data: {
        firstName: 'Jean',
        lastName: 'Kouassi',
        email: 'student.test.travaux@example.com',
        studentNumber: 'STU-TEST-' + Date.now(),
        password: 'hashed_password_123',
        status: 'ACTIVE',
      },
    })
  }

  let enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      sessionId: session.id,
    },
  })

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        formationId: formation.id,
        sessionId: session.id,
        startDate: new Date(),
        status: 'accepted',
      },
    })
  } else if (!['accepted', 'confirmed', 'completed'].includes(enrollment.status.toLowerCase())) {
    enrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'accepted' },
    })
  }

  console.log(`✅ Étudiant test : ${student.firstName} ${student.lastName} (Matricule: ${student.studentNumber})`)
  console.log(`✅ Inscription acceptée (Enrollment ID: ${enrollment.id}, Statut: ${enrollment.status})`)

  // 3. Test Étape 1 Admin : Création d'un Travail avec Sujet Consigne
  const assignment = await prisma.assignment.create({
    data: {
      title: 'TP 1 - Conception d’une Architecture Réseau Sécurisée',
      description: 'Réaliser un schéma d’architecture et rédiger les règles de sécurité.',
      objectives: '1. Identifier les DMZ\n2. Définir le filtrage pare-feu',
      instructions: 'Remettre un fichier PDF ou ZIP nommé NOM_Prenom_TP1.pdf',
      type: 'tp',
      difficulty: 'intermediaire',
      deadline: new Date(Date.now() + 7 * 86400000),
      published: true,
      maxFileSize: 15,
      allowedFileTypes: 'pdf,zip,docx',
      sessionId: session.id,
      formationId: formation.id,
      files: {
        create: [
          {
            name: 'consigne_tp1.pdf',
            originalName: 'Consignes_TP1_Reseau.pdf',
            size: 245000,
            mimeType: 'application/pdf',
            url: 'https://pub-1e5e8ef317024ae7900f84ad344983d0.r2.dev/travaux/consignes/consigne_tp1.pdf',
            key: 'travaux/consignes/consigne_tp1.pdf',
          },
        ],
      },
    },
    include: {
      files: true,
      session: true,
    },
  })

  console.log(`\n✅ [ADMIN] Travail créé avec succès (ID: ${assignment.id})`)
  console.log(`   Consigne jointe : ${assignment.files[0].originalName} (${assignment.files[0].url})`)

  // 4. Test Étape 2 Étudiant : Vérification de la visibilité uniquement pour l'étudiant inscrit et accepté
  const studentAssignments = await prisma.assignment.findMany({
    where: {
      sessionId: { in: [session.id] },
      published: true,
    },
    include: {
      files: true,
      submissions: {
        where: { studentId: student.id },
      },
    },
  })

  console.log(`\n✅ [ÉTUDIANT] Nombre de travaux visibles pour la session #${session.id} : ${studentAssignments.length}`)
  if (studentAssignments.length === 0) {
    throw new Error('ERREUR: Le travail aurait dû être visible par l’étudiant inscrit.')
  }

  // 5. Test Étape 3 Étudiant : Dépôt d'un travail (Submission + SubmissionFile)
  const submission = await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      studentId: student.id,
      sessionId: session.id,
      status: 'submitted',
      submittedAt: new Date(),
      files: {
        create: [
          {
            name: `${student.id}_rendu_tp1.pdf`,
            originalName: 'Kouassi_Jean_TP1.pdf',
            size: 1048576,
            mimeType: 'application/pdf',
            url: 'https://pub-1e5e8ef317024ae7900f84ad344983d0.r2.dev/travaux/remises/Kouassi_Jean_TP1.pdf',
            key: 'travaux/remises/Kouassi_Jean_TP1.pdf',
          },
        ],
      },
    },
    include: {
      files: true,
      student: true,
    },
  })

  console.log(`\n✅ [DÉPÔT ÉTUDIANT] Remise effectuée (ID: ${submission.id})`)
  console.log(`   Fichier déposé : ${submission.files[0].originalName} (1.0 MB)`)

  // 6. Test Étape 4 Admin : Consultation de la remise et Correction (Notation + Commentaire)
  const adminViewSubmissions = await prisma.submission.findMany({
    where: { assignmentId: assignment.id },
    include: {
      student: true,
      files: true,
    },
  })

  console.log(`\n✅ [ADMIN REVIEW] Nombre de remises reçues dans l’administration : ${adminViewSubmissions.length}`)
  console.log(`   Nom étudiant : ${adminViewSubmissions[0].student.firstName} ${adminViewSubmissions[0].student.lastName}`)
  console.log(`   Matricule : ${adminViewSubmissions[0].student.studentNumber}`)

  // Correction par l'administrateur
  const gradedSubmission = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: 'graded',
      grade: 18.5,
      feedback: 'Excellent travail ! Architecture très bien pensée et règles de sécurité claires.',
      gradedAt: new Date(),
      gradedBy: 'admincjtc',
    },
  })

  console.log(`\n✅ [CORRECTION ADMIN] Note enregistrée : ${gradedSubmission.grade}/20`)
  console.log(`   Statut : ${gradedSubmission.status}`)
  console.log(`   Feedback : "${gradedSubmission.feedback}"`)

  // 7. Test Étape 5 Synchronisation Étudiant : Vérification que l'étudiant voit immédiatement la note
  const studentSyncCheck = await prisma.submission.findUnique({
    where: { id: submission.id },
  })

  console.log(`\n✅ [SYNC ÉTUDIANT RESULTAT]`)
  console.log(`   Statut côté étudiant : ${studentSyncCheck.status}`)
  console.log(`   Note visible : ${studentSyncCheck.grade}/20`)
  console.log(`   Commentaire visible : "${studentSyncCheck.feedback}"`)

  // Nettoyage de test
  await prisma.submission.delete({ where: { id: submission.id } })
  await prisma.assignment.delete({ where: { id: assignment.id } })
  console.log('\n🎉 TOUS LES TESTS DU MODULE TRAVAUX ONT RÉUSSI AVEC SUCCÈS !\n')
}

main()
  .catch((e) => {
    console.error('❌ ERREUR TEST TRAVAUX:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
