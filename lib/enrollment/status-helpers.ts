export type EnrollmentStatusTone = 'warning' | 'success' | 'danger' | 'neutral' | 'primary'

export const ENROLLMENT_STATUS_MAP: Record<string, { label: string; tone: EnrollmentStatusTone }> = {
  pending: { label: 'En attente', tone: 'warning' },
  accepted: { label: 'Acceptée', tone: 'success' },
  rejected: { label: 'Rejetée', tone: 'danger' },
  confirmed: { label: 'Confirmée', tone: 'primary' },
  completed: { label: 'Terminée', tone: 'primary' },
  waitlist: { label: 'Liste d\'attente', tone: 'warning' },
  cancelled: { label: 'Annulée', tone: 'neutral' },
}

export function getEnrollmentStatusTone(status: string): EnrollmentStatusTone {
  return ENROLLMENT_STATUS_MAP[status]?.tone || 'neutral'
}

export function getEnrollmentStatusLabel(status: string): string {
  return ENROLLMENT_STATUS_MAP[status]?.label || status
}
