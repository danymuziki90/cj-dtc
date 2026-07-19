/**
 * Script de nettoyage des questions dupliquées en base
 * et vérification de l'état final.
 *
 * Usage : node scripts/clean-duplicate-questions.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== Nettoyage des questions dupliquées ===\n')

  // 1. Récupérer toutes les questions
  const allQuestions = await prisma.sessionFormQuestion.findMany({
    orderBy: [{ sessionId: 'asc' }, { label: 'asc' }, { id: 'asc' }],
  })
  console.log(`Total questions en base : ${allQuestions.length}`)

  // 2. Détecter les doublons par (sessionId, label)
  const seen = new Map() // key: `${sessionId}-${label}` → id gardé
  const toDelete = []

  for (const q of allQuestions) {
    const key = `${q.sessionId}-${q.label.trim().toLowerCase()}`
    if (seen.has(key)) {
      // On garde le premier (id le plus petit), on supprime les suivants
      toDelete.push(q.id)
      console.log(`  → DOUBLON détecté : ID ${q.id} | session ${q.sessionId} | label "${q.label}" (garde ID ${seen.get(key)})`)
    } else {
      seen.set(key, q.id)
    }
  }

  if (toDelete.length === 0) {
    console.log('\n✅ Aucun doublon trouvé — base de données propre.')
  } else {
    console.log(`\n🗑  ${toDelete.length} doublon(s) à supprimer : IDs [${toDelete.join(', ')}]`)

    // Vérifier qu'aucune réponse n'est liée à ces questions dupliquées
    const linkedAnswers = await prisma.sessionFormAnswer.findMany({
      where: { questionId: { in: toDelete } },
    })
    if (linkedAnswers.length > 0) {
      console.warn(`  ⚠️  ${linkedAnswers.length} réponse(s) liée(s) aux doublons — elles seront supprimées par CASCADE.`)
    }

    const deleted = await prisma.sessionFormQuestion.deleteMany({
      where: { id: { in: toDelete } },
    })
    console.log(`\n✅ ${deleted.count} question(s) dupliquée(s) supprimée(s).`)
  }

  // 3. Afficher l'état final par session
  console.log('\n=== État final des questions par session ===')
  const finalQuestions = await prisma.sessionFormQuestion.findMany({
    orderBy: [{ sessionId: 'asc' }, { order: 'asc' }],
  })

  const bySession = {}
  for (const q of finalQuestions) {
    if (!bySession[q.sessionId]) bySession[q.sessionId] = []
    bySession[q.sessionId].push(q)
  }

  for (const [sessionId, qs] of Object.entries(bySession)) {
    console.log(`\nSession ${sessionId} (${qs.length} question(s)) :`)
    for (const q of qs) {
      console.log(`  [${q.id}] ordre=${q.order} | "${q.label}" (${q.type})${q.required ? ' *' : ''}`)
    }
  }

  if (Object.keys(bySession).length === 0) {
    console.log('  (aucune question en base)')
  }

  console.log('\n=== Templates ===')
  const templates = await prisma.sessionFormTemplate.findMany({
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  if (templates.length === 0) {
    console.log('  (aucun template)')
  } else {
    for (const t of templates) {
      console.log(`Template "${t.name}" (${t.questions.length} question(s)) :`)
      for (const q of t.questions) {
        console.log(`  [${q.id}] "${q.label}"`)
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('ERREUR :', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
