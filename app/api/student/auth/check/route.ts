import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-portal/guards'
import { getPortalSecurityOverview } from '@/lib/auth-portal/security'

export const dynamic = 'force-dynamic'

/**
 * GET /api/student/auth/check
 * Vérifie si le cookie student_token est valide.
 * Utilisé pour diagnostiquer les problèmes d'authentification.
 */
export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get('student_token')?.value
  const securityInfo = getPortalSecurityOverview()

  const auth = await requireStudent(req)

  if (auth.error) {
    return NextResponse.json({
      authenticated: false,
      cookiePresent: Boolean(cookieValue),
      cookieLength: cookieValue?.length ?? 0,
      secretSource: securityInfo.studentJwt.source,
      secretValid: securityInfo.studentJwt.valid,
      secretStrong: securityInfo.studentJwt.strong,
      usingFallback: securityInfo.studentJwt.usingFallback,
      message: securityInfo.studentJwt.message,
    }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    studentId: auth.student.id,
    email: auth.student.email,
    status: auth.student.status,
    cookiePresent: true,
    secretSource: securityInfo.studentJwt.source,
    secretValid: securityInfo.studentJwt.valid,
    secretStrong: securityInfo.studentJwt.strong,
    usingFallback: securityInfo.studentJwt.usingFallback,
    message: securityInfo.studentJwt.message,
  })
}
