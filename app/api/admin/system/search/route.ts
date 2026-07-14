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
            id: true,
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
        formation: {
          select: {
            title: true,
          },
        },
      },
    }),
    Promise.resolve([]),
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
      subtitle: `${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(item.startDate)} · ${item.location || 'Lieu a definir'}`,
      badge: item.status,
      href: `/admin/formations?formationId=${item.formation.id}`,
    })),
    enrollments: enrollments.map((item) => ({
      id: item.id,
      label: `${item.firstName} ${item.lastName}`.trim(),
      subtitle: `${item.formation.title} · ${item.email}`,
      badge: item.status,
      href: `/admin/enrollments?search=${encodeURIComponent(item.email)}`,
    })),
    payments: [],
  }

  return NextResponse.json({
    ...payload,
    total: payload.students.length + payload.sessions.length + payload.enrollments.length + payload.payments.length,
  })
}
