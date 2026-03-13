import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

type AuditPayload = {
  request?: NextRequest
  adminId?: string | null
  adminUsername: string
  action: string
  targetType: string
  targetId?: string | null
  targetLabel?: string | null
  summary: string
  status?: string
  metadata?: Record<string, unknown>
}

function getRequestIp(request?: NextRequest) {
  if (!request) return null

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

  return null
}

function cleanMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined

  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  )
}

export async function writeAdminAuditLog(payload: AuditPayload) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: payload.adminId || null,
        adminUsername: payload.adminUsername,
        action: payload.action,
        targetType: payload.targetType,
        targetId: payload.targetId || null,
        targetLabel: payload.targetLabel || null,
        summary: payload.summary,
        status: payload.status || 'success',
        metadata: cleanMetadata(payload.metadata) as any,
        ipAddress: getRequestIp(payload.request),
        userAgent: payload.request?.headers.get('user-agent') || null,
      },
    })
  } catch (error) {
    console.error('Admin audit log write failed:', error)
  }
}
