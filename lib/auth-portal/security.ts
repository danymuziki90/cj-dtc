const MIN_SECRET_LENGTH = 32
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-change-me'
const weakSecretMarkers = [
  'change-me',
  'dev-only-insecure-secret-change-me',
  'your-secret-key-change-in-production',
  'super-secret-dev-key-change-this',
]

type PortalSecretKey = 'ADMIN_JWT_SECRET' | 'STUDENT_JWT_SECRET'
type SecretSource = PortalSecretKey | 'NEXTAUTH_SECRET' | 'DEV_FALLBACK'

type SecretResolution = {
  value: string
  source: SecretSource
  valid: boolean
  strong: boolean
  usingFallback: boolean
  message: string
}

const securityWarnings = new Set<string>()

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

function isWeakSecret(value?: string | null) {
  if (!value) return true
  if (value.length < MIN_SECRET_LENGTH) return true

  const normalized = value.toLowerCase()
  return weakSecretMarkers.some((marker) => normalized.includes(marker))
}

function warnOnce(key: string, message: string) {
  if (securityWarnings.has(key)) return
  securityWarnings.add(key)
  console.warn(message)
}

function buildSecretMessage(secretKey: PortalSecretKey, resolution: SecretResolution) {
  const label = secretKey === 'ADMIN_JWT_SECRET' ? 'JWT admin' : 'JWT etudiant'

  if (resolution.source === 'DEV_FALLBACK') {
    return `${label}: fallback de developpement actif. Configurez un secret fort avant la production.`
  }

  if (resolution.usingFallback) {
    return `${label}: fallback sur NEXTAUTH_SECRET car ${secretKey} est absent ou trop faible.`
  }

  if (!resolution.valid) {
    return `${label}: secret absent ou trop faible. Minimum ${MIN_SECRET_LENGTH} caracteres.`
  }

  return `${label}: configuration valide.`
}

function resolvePortalSecret(secretKey: PortalSecretKey): SecretResolution {
  const dedicatedSecret = process.env[secretKey]?.trim()
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim()

  if (dedicatedSecret && !isWeakSecret(dedicatedSecret)) {
    const resolution = {
      value: dedicatedSecret,
      source: secretKey,
      valid: true,
      strong: true,
      usingFallback: false,
      message: '',
    } satisfies SecretResolution

    return { ...resolution, message: buildSecretMessage(secretKey, resolution) }
  }

  if (nextAuthSecret && !isWeakSecret(nextAuthSecret)) {
    const resolution = {
      value: nextAuthSecret,
      source: 'NEXTAUTH_SECRET',
      valid: true,
      strong: true,
      usingFallback: true,
      message: '',
    } satisfies SecretResolution

    return { ...resolution, message: buildSecretMessage(secretKey, resolution) }
  }

  if (!isProduction()) {
    const resolution = {
      value: DEV_FALLBACK_SECRET,
      source: 'DEV_FALLBACK',
      valid: false,
      strong: false,
      usingFallback: false,
      message: '',
    } satisfies SecretResolution

    return { ...resolution, message: buildSecretMessage(secretKey, resolution) }
  }

  const candidate = dedicatedSecret || nextAuthSecret || ''
  const resolution = {
    value: candidate,
    source: dedicatedSecret ? secretKey : 'NEXTAUTH_SECRET',
    valid: false,
    strong: false,
    usingFallback: !dedicatedSecret && Boolean(nextAuthSecret),
    message: '',
  } satisfies SecretResolution

  return { ...resolution, message: buildSecretMessage(secretKey, resolution) }
}

export function getPortalSecret(secretKey: PortalSecretKey) {
  const resolution = resolvePortalSecret(secretKey)

  if (isProduction() && !resolution.valid) {
    throw new Error(
      `${secretKey} ou NEXTAUTH_SECRET doit etre configure avec au moins ${MIN_SECRET_LENGTH} caracteres en production.`
    )
  }

  if (!resolution.valid) {
    warnOnce(
      secretKey,
      `[auth-security] ${resolution.message}`
    )
  }

  return new TextEncoder().encode(resolution.value)
}

export function ensurePortalSecretReady(secretKey: PortalSecretKey) {
  const resolution = resolvePortalSecret(secretKey)

  if (!resolution.valid) {
    throw new Error(
      `${secretKey} ou NEXTAUTH_SECRET doit etre configure avec un secret fort avant de signer des tokens.`
    )
  }
}

export function isEmergencyAdminLoginAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.ADMIN_ALLOW_EMERGENCY_LOGIN !== 'false'
}

export function getPortalSecurityOverview() {
  const adminJwt = resolvePortalSecret('ADMIN_JWT_SECRET')
  const studentJwt = resolvePortalSecret('STUDENT_JWT_SECRET')

  return {
    environment: process.env.NODE_ENV || 'development',
    emergencyAdminLoginAllowed: isEmergencyAdminLoginAllowed(),
    minimumSecretLength: MIN_SECRET_LENGTH,
    adminJwt: {
      source: adminJwt.source,
      strong: adminJwt.strong,
      valid: adminJwt.valid,
      usingFallback: adminJwt.usingFallback,
      message: adminJwt.message,
    },
    studentJwt: {
      source: studentJwt.source,
      strong: studentJwt.strong,
      valid: studentJwt.valid,
      usingFallback: studentJwt.usingFallback,
      message: studentJwt.message,
    },
  }
}
