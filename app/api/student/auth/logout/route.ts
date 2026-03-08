import { NextResponse } from 'next/server'
import { STUDENT_AUTH_COOKIE, getAuthCookieOptions } from '@/lib/auth-portal/jwt'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(STUDENT_AUTH_COOKIE, '', { ...getAuthCookieOptions(0), maxAge: 0 })
  return response
}
