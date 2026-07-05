import { SignJWT, jwtVerify } from 'jose'
import { getPortalSecret } from '@/lib/auth-portal/security'

export const ADMIN_AUTH_COOKIE = 'admin_token'
export const STUDENT_AUTH_COOKIE = 'student_token'

const ONE_DAY_IN_SECONDS = 60 * 60 * 24
const SEVEN_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 7

type BaseTokenPayload = {
  sub: string
  username: string
  role: 'ADMIN' | 'STUDENT'
}

export type AdminTokenPayload = BaseTokenPayload & {
  role: 'ADMIN'
}

export type StudentTokenPayload = BaseTokenPayload & {
  role: 'STUDENT'
  studentId: string
}

async function signToken(payload: AdminTokenPayload | StudentTokenPayload, secretKey: Uint8Array, expiresInSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .sign(secretKey)
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, 'role'>) {
  return signToken({ ...payload, role: 'ADMIN' }, getPortalSecret('ADMIN_JWT_SECRET'), ONE_DAY_IN_SECONDS)
}

export async function signStudentToken(payload: Omit<StudentTokenPayload, 'role'>) {
  return signToken({ ...payload, role: 'STUDENT' }, getPortalSecret('STUDENT_JWT_SECRET'), SEVEN_DAYS_IN_SECONDS)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getPortalSecret('ADMIN_JWT_SECRET'))
    if (payload.role !== 'ADMIN') return null

    return payload as unknown as AdminTokenPayload
  } catch {
    return null
  }
}

export async function verifyStudentToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getPortalSecret('STUDENT_JWT_SECRET'))
    if (payload.role !== 'STUDENT') return null

    return payload as unknown as StudentTokenPayload
  } catch {
    return null
  }
}

export function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export const ADMIN_TOKEN_MAX_AGE = ONE_DAY_IN_SECONDS
export const STUDENT_TOKEN_MAX_AGE = SEVEN_DAYS_IN_SECONDS
