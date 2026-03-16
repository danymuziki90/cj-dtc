export function formatPortalCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatPortalDate(value: string | Date | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatPortalDateTime(value: string | Date | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function statusToneClass(value: string) {
  const normalized = String(value || '').toLowerCase().trim()
  if (!normalized) return 'border-slate-200 bg-slate-100 text-slate-700'
  if (
    ['success', 'approved', 'verified', 'active', 'complete', 'completed', 'confirmed', 'accepted', 'paid', 'validated', 'present'].some(
      (token) => normalized.includes(token),
    )
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (
    ['pending', 'review', 'submitted', 'processing', 'partial', 'upcoming', 'scheduled', 'waiting', 'late', 'open'].some((token) =>
      normalized.includes(token),
    )
  ) {
    return 'border-blue-200 bg-blue-50 text-[var(--cj-blue)]'
  }

  if (
    ['failed', 'rejected', 'error', 'cancelled', 'canceled', 'expired', 'closed', 'suspended', 'absent'].some((token) =>
      normalized.includes(token),
    )
  ) {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-slate-200 bg-slate-100 text-slate-700'
}

export function paymentMethodLabel(value: string) {
  if (value === 'mobile_money') return 'Mobile Money'
  if (value === 'bank_transfer') return 'Virement bancaire'
  if (value === 'card') return 'Carte bancaire'
  if (value === 'cash') return 'Especes'
  return value || '-'
}
