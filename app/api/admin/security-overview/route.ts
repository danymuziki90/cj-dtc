import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { getPortalSecurityOverview } from '@/lib/auth-portal/security'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/security-overview
 * Retourne l'état des secrets JWT admin et étudiant.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  return NextResponse.json(getPortalSecurityOverview())
}
