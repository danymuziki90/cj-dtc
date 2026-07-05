export type ProgramSessionType = 'MRH' | 'IOP' | 'CONFERENCE_FORUM'

type SessionTypeInput = {
  title?: string | null
  description?: string | null
  format?: string | null
  formation?: {
    title?: string | null
    categorie?: string | null
    description?: string | null
  } | null
}

const MRH_KEYWORDS = ['mrh', 'ressource humaine', 'ressources humaines', 'human resource', 'hr']
const IOP_KEYWORDS = ['iop', 'insertion', 'orientation professionnelle', 'employabilite', 'employability']
const CONFERENCE_KEYWORDS = ['conference', 'forum', 'summit', 'congres', 'table ronde']

function normalize(value?: string | null) {
  return (value || '').toLowerCase()
}

function hasAnyKeyword(haystack: string, keywords: string[]) {
  return keywords.some((keyword) => haystack.includes(keyword))
}

export function inferProgramSessionType(input: SessionTypeInput): ProgramSessionType {
  const searchSpace = [
    normalize(input.title),
    normalize(input.description),
    normalize(input.format),
    normalize(input.formation?.title),
    normalize(input.formation?.categorie),
    normalize(input.formation?.description),
  ].join(' ')

  if (hasAnyKeyword(searchSpace, CONFERENCE_KEYWORDS)) return 'CONFERENCE_FORUM'
  if (hasAnyKeyword(searchSpace, IOP_KEYWORDS)) return 'IOP'
  if (hasAnyKeyword(searchSpace, MRH_KEYWORDS)) return 'MRH'

  return 'MRH'
}

export function getProgramSessionTypeLabel(type: ProgramSessionType) {
  switch (type) {
    case 'MRH':
      return 'MRH'
    case 'IOP':
      return 'IOP'
    case 'CONFERENCE_FORUM':
      return 'Conference / Forum'
    default:
      return 'MRH'
  }
}
