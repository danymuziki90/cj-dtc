import { NextRequest } from 'next/server'

type RateLimitState = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  bucket: string
  identifier: string
  limit: number
  windowMs: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __authRateLimitStore?: Map<string, RateLimitState>
}

const rateLimitStore = globalForRateLimit.__authRateLimitStore ?? new Map<string, RateLimitState>()

if (!globalForRateLimit.__authRateLimitStore) {
  globalForRateLimit.__authRateLimitStore = rateLimitStore
}

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase() || 'anonymous'
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  const fallbackHeaders = ['x-real-ip', 'cf-connecting-ip', 'fly-client-ip']
  for (const header of fallbackHeaders) {
    const value = request.headers.get(header)?.trim()
    if (value) return value
  }

  return 'unknown'
}

export function buildRateLimitIdentifier(request: NextRequest, scopedValue?: string) {
  const ip = getClientIp(request)
  const scope = scopedValue ? normalizeIdentifier(scopedValue) : 'anonymous'
  return `${ip}:${scope}`
}

export function consumeRateLimit({ bucket, identifier, limit, windowMs }: RateLimitOptions) {
  const now = Date.now()
  const key = `${bucket}:${normalizeIdentifier(identifier)}`
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    const nextState = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, nextState)

    return {
      allowed: true,
      remaining: Math.max(0, limit - nextState.count),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  rateLimitStore.set(key, current)

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  }
}
