import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const [session, news, submissions, certificate] = await Promise.all([
    auth.student.adminSessionId
      ? prisma.adminTrainingSession.findUnique({
          where: { id: auth.student.adminSessionId },
        })
      : Promise.resolve(null),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.studentSubmission.findMany({
      where: { studentId: auth.student.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentCertificate.findFirst({
      where: { studentId: auth.student.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    student: {
      id: auth.student.id,
      name: `${auth.student.firstName} ${auth.student.lastName}`.trim(),
      username: auth.student.username,
      email: auth.student.email,
    },
    session,
    news,
    submissions,
    certificate,
  })
}
