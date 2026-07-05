import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAdminAuditLog } from '@/lib/admin/audit'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { resolveAppBaseUrl, sendStudentPortalAccessEmail, withEmailTimeout } from '@/lib/email'

const sendStudentAccessEmailSchema = z.object({
  studentId: z.string().optional().nullable(),
  email: z.string().email(),
  fullName: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(3),
  sessionTitle: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const parsed = sendStudentAccessEmailSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const { studentId, email, fullName, username, password, sessionTitle } = parsed.data

    await withEmailTimeout(
      sendStudentPortalAccessEmail({
        to: email,
        fullName,
        username,
        password,
        appBaseUrl: resolveAppBaseUrl(request.url),
        sessionTitle: sessionTitle || null,
      })
    )

    await writeAdminAuditLog({
      request,
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      action: 'student.credentials_email.manual_send',
      targetType: 'student',
      targetId: studentId || null,
      targetLabel: fullName,
      summary: `Identifiants etudiant envoyes manuellement a ${email}.`,
      metadata: {
        email,
        username,
        sessionTitle: sessionTitle || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manual student credentials email failed:', error)
    return NextResponse.json(
      {
        error: 'Unable to send credentials email.',
        details: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}