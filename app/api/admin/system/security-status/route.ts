import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { getPortalSecurityOverview } from '@/lib/auth-portal/security'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  return NextResponse.json(getPortalSecurityOverview())
}
