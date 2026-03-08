import { NextResponse } from 'next/server'
import { ADMIN_AUTH_COOKIE, getAuthCookieOptions } from '@/lib/auth-portal/jwt'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_AUTH_COOKIE, '', { ...getAuthCookieOptions(0), maxAge: 0 })
  return response
}
