import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const query = (request.nextUrl.searchParams.get('q') || '').trim()
  if (query.length < 2) {
    return NextResponse.json({ query, students: [], sessions: [], enrollments: [], payments: [], total: 0 })
  }

  const { prisma } = await import('@/lib/prisma')

  const [students, sessions, enrollments, payments] = await Promise.all([
    prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        username: true,
      },
    }),
    prisma.trainingSession.findMany({
      where: {
        OR: [
          { formation: { title: { contains: query, mode: 'insensitive' } } },
          { location: { contains: query, mode: 'insensitive' } },
          { status: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { startDate: 'asc' },
      take: 5,
      select: {
        id: true,
        startDate: true,
        location: true,
        status: true,
        formation: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { formation: { title: { contains: query, mode: 'insensitive' } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        paymentStatus: true,
        formation: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        OR: [
          { reference: { contains: query, mode: 'insensitive' } },
          { transactionId: { contains: query, mode: 'insensitive' } },
          { enrollment: { email: { contains: query, mode: 'insensitive' } } },
          { enrollment: { formation: { title: { contains: query, mode: 'insensitive' } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        status: true,
        reference: true,
        transactionId: true,
        enrollment: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            formation: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
  ])

  const payload = {
    query,
    students: students.map((item) => ({
      id: item.id,
      label: `${item.firstName} ${item.lastName}`.trim(),
      subtitle: `${item.email}${item.username ? ` · ${item.username}` : ''}`,
      badge: item.status,
      href: `/admin/students?search=${encodeURIComponent(item.email)}`,
    })),
    sessions: sessions.map((item) => ({
      id: item.id,
      label: item.formation.title,
      subtitle: `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(item.startDate)} · ${item.location || 'Lieu a confirmer'}`,
      badge: item.status,
      href: `/admin/sessions#session-${item.id}`,
    })),
    enrollments: enrollments.map((item) => ({
      id: item.id,
      label: `${item.firstName} ${item.lastName}`.trim(),
      subtitle: `${item.formation.title} · ${item.email}`,
      badge: `${item.status} / ${item.paymentStatus}`,
      href: `/admin/enrollments?search=${encodeURIComponent(item.email)}`,
    })),
    payments: payments.map((item) => ({
      id: item.id,
      label: `${item.enrollment.firstName} ${item.enrollment.lastName}`.trim(),
      subtitle: `${item.enrollment.formation.title} · ${item.reference || item.transactionId || 'sans reference'}`,
      badge: item.status,
      href: `/admin/payments?search=${encodeURIComponent(item.reference || item.transactionId || item.enrollment.email)}`,
    })),
  }

  return NextResponse.json({
    ...payload,
    total: payload.students.length + payload.sessions.length + payload.enrollments.length + payload.payments.length,
  })
}
