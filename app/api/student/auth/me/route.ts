import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-portal/guards'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  return NextResponse.json({
    student: {
      id: auth.student.id,
      name: `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      email: auth.student.email,
      username: auth.student.username,
    },
  })
}
