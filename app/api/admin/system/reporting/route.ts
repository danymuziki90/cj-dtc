import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { buildAdminReportingSnapshot, type ReportingPeriod } from '@/lib/admin/reporting'

function parsePeriod(raw: string | null): ReportingPeriod {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === '365d' || raw === 'all') return raw
  return '30d'
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const period = parsePeriod(request.nextUrl.searchParams.get('period'))
  const snapshot = await buildAdminReportingSnapshot(period)

  return NextResponse.json(snapshot)
}
