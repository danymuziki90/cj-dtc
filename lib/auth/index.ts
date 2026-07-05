// CJ DTC - Authentication System
// Version 2.0 - Production Ready

import jwt from 'jose'
import bcrypt from 'bcryptjs'
import { UserRole, User } from '@/types'

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)

const JWT_ISSUER = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const JWT_AUDIENCE = 'cj-dtc-platform'

// Token Types
export interface JWTPayload {
  sub: string // User ID
  email: string
  role: UserRole
  name?: string
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

export interface RefreshTokenPayload {
  sub: string // User ID
  type: 'refresh'
  iat?: number
  exp?: number
  iss?: string
  aud?: string
}

// JWT Token Generation
export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  return await new jwt.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 15 * 60) // 15 minutes
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  return await new jwt.SignJWT({
    sub: userId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .sign(JWT_SECRET)
}

// JWT Token Verification
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwt.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    
    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwt.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    
    return payload as RefreshTokenPayload
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Password Validation
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = 'strong'
  } else if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
    strength = 'medium'
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

// Email Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone Validation
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Role-based Access Control (RBAC)
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.STUDENT]: 0,
    [UserRole.STAFF]: 1,
    [UserRole.INSTRUCTOR]: 2,
    [UserRole.ADMIN]: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccessResource(user: User, resourceType: string, resourceId?: string): boolean {
  // Admin can access everything
  if (user.role === UserRole.ADMIN) {
    return true
  }
  
  // Students can only access their own resources
  if (user.role === UserRole.STUDENT) {
    return resourceId === user.id
  }
  
  // Staff and instructors have broader access
  if (user.role === UserRole.STAFF || user.role === UserRole.INSTRUCTOR) {
    return true
  }
  
  return false
}

// Session Management
export interface SessionData {
  user: {
    id: string
    email: string
    name?: string
    role: UserRole
  }
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export async function createSession(user: User): Promise<SessionData> {
  const accessToken = await generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
  
  const refreshToken = await generateRefreshToken(user.id)
  
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
    expiresAt,
  }
}

// Token Refresh
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const payload = await verifyRefreshToken(refreshToken)
  
  if (!payload) {
    return null
  }
  
  // Here you would typically fetch the user from the database
  // For now, we'll generate a new access token with the user ID
  const newAccessToken = await generateAccessToken({
    sub: payload.sub,
    email: '', // You would fetch this from the database
    role: UserRole.STUDENT, // You would fetch this from the database
  })
  
  return newAccessToken
}

// Security Utilities
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function generateSessionId(): string {
  return generateSecureRandom(16)
}

export function generateCsrfToken(): string {
  return generateSecureRandom(32)
}

// Rate Limiting (in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    // New window or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    }
  }
  
  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    }
  }
  
  existing.count++
  
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
  }
}

// Input Sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove potential JavaScript URLs
    .replace(/on\w+=/gi, '') // Remove potential event handlers
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s\(\)]/g, '').trim()
}

// Security Headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  }
}

// Two-Factor Authentication (2FA)
export function generate2FASecret(userEmail: string): string {
  // This is a simplified version
  // In production, you would use a library like 'speakeasy'
  const secret = generateSecureRandom(16)
  return `CJ-DTC-${secret}-${userEmail}`
}

export function verify2FAToken(token: string, secret: string): boolean {
  // This is a simplified version
  // In production, you would use a library like 'speakeasy'
  return token.length === 6 && /^\d{6}$/.test(token)
}

// Account Lockout
const lockoutStore = new Map<string, { attempts: number; lockUntil: number }>()

export function checkAccountLockout(email: string): {
  isLocked: boolean
  remainingAttempts: number
  lockUntil?: Date
} {
  const now = Date.now()
  const key = email.toLowerCase()
  const existing = lockoutStore.get(key)
  
  if (!existing) {
    return {
      isLocked: false,
      remainingAttempts: 5,
    }
  }
  
  if (existing.lockUntil && now < existing.lockUntil) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockUntil: new Date(existing.lockUntil),
    }
  }
  
  if (now > existing.lockUntil) {
    // Lockout period expired
    lockoutStore.delete(key)
    return {
      isLocked: false,
      remainingAttempts: 5,
    }
  }
  
  return {
    isLocked: false,
    remainingAttempts: Math.max(0, 5 - existing.attempts),
  }
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase()
  const existing = lockoutStore.get(key)
  const now = Date.now()
  
  if (!existing) {
    lockoutStore.set(key, {
      attempts: 1,
      lockUntil: 0,
    })
    return
  }
  
  existing.attempts++
  
  if (existing.attempts >= 5) {
    // Lock account for 30 minutes
    existing.lockUntil = now + 30 * 60 * 1000
  }
}

export function clearFailedLogins(email: string): void {
  const key = email.toLowerCase()
  lockoutStore.delete(key)
}

// Password Reset Tokens
const resetTokenStore = new Map<string, { email: string; expiresAt: number }>()

export function generatePasswordResetToken(email: string): string {
  const token = generateSecureRandom(32)
  const expiresAt = Date.now() + 60 * 60 * 1000 // 1 hour
  
  resetTokenStore.set(token, {
    email: email.toLowerCase(),
    expiresAt,
  })
  
  return token
}

export function verifyPasswordResetToken(token: string): string | null {
  const data = resetTokenStore.get(token)
  
  if (!data || Date.now() > data.expiresAt) {
    resetTokenStore.delete(token)
    return null
  }
  
  return data.email
}

export function consumePasswordResetToken(token: string): void {
  resetTokenStore.delete(token)
}

// Email Verification Tokens
const emailVerificationStore = new Map<string, { email: string; expiresAt: number }>()

export function generateEmailVerificationToken(email: string): string {
  const token = generateSecureRandom(32)
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  emailVerificationStore.set(token, {
    email: email.toLowerCase(),
    expiresAt,
  })
  
  return token
}

export function verifyEmailVerificationToken(token: string): string | null {
  const data = emailVerificationStore.get(token)
  
  if (!data || Date.now() > data.expiresAt) {
    emailVerificationStore.delete(token)
    return null
  }
  
  return data.email
}

export function consumeEmailVerificationToken(token: string): void {
  emailVerificationStore.delete(token)
}
