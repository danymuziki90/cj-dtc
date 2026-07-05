export type ManagedSessionType = 'MRH' | 'IOP' | 'CONFERENCE_FORUM'
export type ParticipationType = 'en_ligne' | 'hybride' | 'presentiel'

export type SessionAdminMetadata = {
  customTitle?: string
  sessionType?: ManagedSessionType
  durationLabel?: string
  paymentInfo?: string
  participationType?: ParticipationType
  imageUrl?: string
}

const METADATA_PREFIX = 'CJ_SESSION_META:'

export function serializeSessionMetadata(
  metadata: SessionAdminMetadata,
  prerequisitesText?: string | null
) {
  const payload = {
    metadata,
    prerequisitesText: prerequisitesText || '',
  }

  return `${METADATA_PREFIX}${JSON.stringify(payload)}`
}

export function parseSessionMetadata(rawPrerequisites?: string | null) {
  const defaultResult: {
    metadata: SessionAdminMetadata
    prerequisitesText: string
    isEncoded: boolean
  } = {
    metadata: {},
    prerequisitesText: rawPrerequisites || '',
    isEncoded: false,
  }

  if (!rawPrerequisites || !rawPrerequisites.startsWith(METADATA_PREFIX)) {
    return defaultResult
  }

  try {
    const rawJson = rawPrerequisites.slice(METADATA_PREFIX.length)
    const parsed = JSON.parse(rawJson) as {
      metadata?: SessionAdminMetadata
      prerequisitesText?: string
    }

    return {
      metadata: parsed.metadata || {},
      prerequisitesText: parsed.prerequisitesText || '',
      isEncoded: true,
    }
  } catch {
    return defaultResult
  }
}

export function normalizeParticipationType(format?: string | null): ParticipationType {
  const value = (format || '').toLowerCase()
  if (value.includes('hybride')) return 'hybride'
  if (value.includes('distanciel') || value.includes('online') || value.includes('en ligne')) return 'en_ligne'
  return 'presentiel'
}

export function mapParticipationTypeToFormat(value: ParticipationType): string {
  switch (value) {
    case 'en_ligne':
      return 'distanciel'
    case 'hybride':
      return 'hybride'
    case 'presentiel':
      return 'presentiel'
    default:
      return 'presentiel'
  }
}
