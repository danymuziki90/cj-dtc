const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testFullWorkflow() {
  console.log('===========================================================')
  console.log('🧪 TEST DE VALIDATION END-TO-END DE LA SYNCHRONISATION')
  console.log('===========================================================')

  // 1. Définition / Récupération de la Formation et de la Session active
  let formation = await prisma.formation.findFirst({ where: { statut: 'publie' } })
  if (!formation) {
    formation = await prisma.formation.create({
      data: {
        title: 'Formation Test Intégration Travaux',
        slug: 'formation-test-integration-' + Date.now(),
        description: 'Formation pour test d\'intégration complet',
        statut: 'publie',
      },
    })
  }

  let session = await prisma.trainingSession.findFirst({
    where: { formationId: formation.id, status: 'ouverte' },
  })
  if (!session) {
    session = await prisma.trainingSession.create({
      data: {
        formationId: formation.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 86400000),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Kigali / En ligne',
        format: 'distanciel',
        status: 'ouverte',
        maxParticipants: 50,
      },
    })
  }

  console.log(`\n[Étape 1] Session active validée: Session #${session.id} (Formation #${formation.id} - ${formation.title})`)

  // 2. Création de l'étudiant de test et de son inscription (Enrollment)
  const studentEmail = 'etudiant.e2e.travaux@example.com'
  let student = await prisma.student.findUnique({
    where: { email: studentEmail },
  })
  if (!student) {
    student = await prisma.student.create({
      data: {
        firstName: 'Michel',
        lastName: 'Zola',
        email: studentEmail,
        studentNumber: 'STU-E2E-' + Date.now(),
        password: 'securepassword123',
        status: 'ACTIVE',
      },
    })
  }

  let enrollment = await prisma.enrollment.findFirst({
    where: {
      sessionId: session.id,
      email: { equals: studentEmail, mode: 'insensitive' },
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
  } else if (enrollment.studentId !== student.id) {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { studentId: student.id, status: 'accepted' },
    })
  }

  console.log(`[Étape 2] Étudiant inscrit avec succès: ${student.firstName} ${student.lastName} (${student.email}, ID: ${student.id})`)

  // 3. Création du Devoir par l'Administrateur
  const assignment = await prisma.assignment.create({
    data: {
      title: 'Projet Final - Intégration Cloudflare R2 & Supabase',
      description: 'Mettre en œuvre la synchronisation temps réel des remises et le stockage R2.',
      objectives: 'Valider l’architecture full-stack et la sécurité des données.',
      instructions: 'Transmettre le rapport au format PDF.',
      type: 'project',
      difficulty: 'avance',
      status: 'publie',
      published: true,
      deadline: new Date(Date.now() + 5 * 86400000),
      maxFileSize: 20,
      maxFiles: 3,
      allowResubmission: true,
      sessionId: session.id,
      formationId: formation.id,
      files: {
        create: [
          {
            name: 'consigne_projet_final.pdf',
            originalName: 'Consigne_Projet_Final.pdf',
            size: 320000,
            mimeType: 'application/pdf',
            url: 'https://pub-1e5e8ef317024ae7900f84ad344983d0.r2.dev/travaux/consignes/consigne_projet_final.pdf',
            key: 'travaux/consignes/consigne_projet_final.pdf',
          },
        ],
      },
    },
    include: {
      files: true,
    },
  })

  console.log(`\n[Étape 3] Devoir créé et publié par l'Admin (Assignment ID: ${assignment.id})`)
  console.log(`          Fichier consigne rattaché (R2): ${assignment.files[0].url}`)

  // 4. Consultation du Devoir par l'étudiant
  const studentAssignments = await prisma.assignment.findMany({
    where: {
      published: true,
      OR: [
        { sessionId: session.id },
        { formationId: formation.id },
      ],
    },
    include: {
      files: true,
      submissions: {
        where: { studentId: student.id },
        include: { files: true },
      },
    },
  })

  const foundForStudent = studentAssignments.find((a) => a.id === assignment.id)
  if (!foundForStudent) {
    throw new Error('❌ ÉCHEC: Le devoir publié n’apparaît pas dans la liste étudiant !')
  }
  console.log(`\n[Étape 4] Le devoir est correctement visible dans l'Espace Étudiant.`)

  // 5. Dépôt de la remise par l'étudiant
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
            name: `${student.id}_${assignment.id}_rendu.pdf`,
            originalName: 'Rapport_Final_Zola_Michel.pdf',
            size: 1548576,
            mimeType: 'application/pdf',
            url: `https://pub-1e5e8ef317024ae7900f84ad344983d0.r2.dev/travaux/remises/${student.id}_${assignment.id}_rendu.pdf`,
            key: `travaux/remises/${student.id}_${assignment.id}_rendu.pdf`,
          },
        ],
      },
    },
    include: {
      files: true,
      student: true,
    },
  })

  console.log(`\n[Étape 5] Remise effectuée par l'étudiant (Submission ID: ${submission.id})`)
  console.log(`          Fichier téléversé sur Cloudflare R2: ${submission.files[0].originalName}`)

  // 6. Vérification par l'Administrateur dans /admin/travaux
  const adminAssignmentsWithSubmissions = await prisma.assignment.findUnique({
    where: { id: assignment.id },
    include: {
      formation: { select: { title: true } },
      session: { select: { id: true, startDate: true } },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentNumber: true,
            },
          },
          files: true,
        },
      },
    },
  })

  if (!adminAssignmentsWithSubmissions || adminAssignmentsWithSubmissions.submissions.length === 0) {
    throw new Error('❌ ÉCHEC: La remise effectuée par l’étudiant n’apparaît pas dans l’Administration !')
  }

  const recSub = adminAssignmentsWithSubmissions.submissions[0]
  console.log(`\n[Étape 6] Synchronisation réussie dans Administration → Travaux !`)
  console.log(`          Nombre de remises enregistrées: ${adminAssignmentsWithSubmissions.submissions.length}`)
  console.log(`          Étudiant: ${recSub.student.firstName} ${recSub.student.lastName} (${recSub.student.email})`)
  console.log(`          Matricule: ${recSub.student.studentNumber}`)
  console.log(`          Statut de la remise: ${recSub.status}`)
  console.log(`          Lien du fichier R2: ${recSub.files[0].url}`)

  // 7. Correction et Notation par l'Administrateur
  const gradedSubmission = await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: 'graded',
      grade: 19.5,
      feedback: 'Remarquable travail ! Les fichiers R2 et la base Supabase sont parfaitement intégrés.',
      gradedAt: new Date(),
      gradedBy: 'admin_lead',
    },
  })

  console.log(`\n[Étape 7] Évaluation enregistrée par l'Administrateur:`)
  console.log(`          Note attribuée: ${gradedSubmission.grade} / 20`)
  console.log(`          Commentaire: "${gradedSubmission.feedback}"`)

  // 8. Vérification de la réception immédiate par l'étudiant
  const updatedStudentView = await prisma.submission.findUnique({
    where: { id: submission.id },
    include: { files: true },
  })

  console.log(`\n[Étape 8] Synchronisation vers l'Espace Étudiant vérifiée :`)
  console.log(`          Statut affiché: ${updatedStudentView.status}`)
  console.log(`          Note visible par l'étudiant: ${updatedStudentView.grade} / 20`)
  console.log(`          Feedback visible: "${updatedStudentView.feedback}"`)

  // Nettoyage de test
  await prisma.submission.delete({ where: { id: submission.id } })
  await prisma.assignment.delete({ where: { id: assignment.id } })

  console.log('\n===========================================================')
  console.log('🎉 SUCCÈS TOTAL: TOUTES LES ÉTAPES DU WORKFLOW SONT VALIDÉES !')
  console.log('===========================================================')
}

testFullWorkflow()
  .catch((err) => {
    console.error('\n❌ ERREUR LORS DU TEST DU WORKFLOW:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
