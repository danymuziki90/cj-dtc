export type PublicFormationCandidate = {
  title?: string | null
  categorie?: string | null
  description?: string | null
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() || ''
}

export function isE2EFormationFixture(candidate: PublicFormationCandidate) {
  const title = normalize(candidate.title)
  const category = normalize(candidate.categorie)
  const description = normalize(candidate.description)

  return (
    title.startsWith('e2e formation') ||
    category === 'e2e' ||
    description.includes('test e2e')
  )
}
