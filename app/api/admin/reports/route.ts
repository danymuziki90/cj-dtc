import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { toCanonicalPaymentStatus } from '@/lib/payments/status'

const reportRequestSchema = z.object({
  type: z.enum(['students', 'formations', 'inscriptions', 'revenue']),
  period: z.string().optional().default('30d'),
})

function resolvePeriodStart(period: string) {
  const now = new Date()

  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === '30d' || period === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (period === '90d' || period === 'quarter') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  if (period === '365d' || period === 'year') return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  return null
}

async function buildStudentsReport(period: string) {
  const since = resolvePeriodStart(period)
  const studentWhere = since ? { createdAt: { gte: since } } : {}
  const [totalStudents, activeStudents, suspendedStudents, recentStudents, enrollments] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.student.count({ where: { ...studentWhere, status: 'ACTIVE' } }),
    prisma.student.count({ where: { ...studentWhere, status: 'SUSPENDED' } }),
    prisma.student.count({ where: since ? { createdAt: { gte: since } } : {} }),
    prisma.enrollment.count({ where: since ? { createdAt: { gte: since } } : {} }),
  ])

  return {
    totalStudents,
    activeStudents,
    suspendedStudents,
    recentStudents,
    averageEnrollmentsPerStudent: totalStudents > 0 ? Number((enrollments / totalStudents).toFixed(2)) : 0,
  }
}

async function buildFormationsReport(period: string) {
  const since = resolvePeriodStart(period)
  const formationWhere = since ? { createdAt: { gte: since } } : {}
  const [totalFormations, publishedFormations, enrollmentsByFormation, sessionsByFormation] = await Promise.all([
    prisma.formation.count({ where: formationWhere }),
    prisma.formation.count({ where: { ...formationWhere, statut: 'publie' } }),
    prisma.enrollment.groupBy({
      by: ['formationId'],
      _count: { _all: true },
      where: since ? { createdAt: { gte: since } } : undefined,
      orderBy: { _count: { formationId: 'desc' } },
      take: 5,
    }),
    prisma.trainingSession.groupBy({
      by: ['formationId'],
      _count: { _all: true },
      where: since ? { createdAt: { gte: since } } : undefined,
    }),
  ])

  const formationIds = enrollmentsByFormation.map((item) => item.formationId)
  const formations = formationIds.length
    ? await prisma.formation.findMany({
        where: { id: { in: formationIds } },
        select: { id: true, title: true, categorie: true },
      })
    : []
  const formationMap = new Map(formations.map((formation) => [formation.id, formation]))
  const sessionsMap = new Map(sessionsByFormation.map((item) => [item.formationId, item._count._all]))

  return {
    totalFormations,
    publishedFormations,
    topFormations: enrollmentsByFormation.map((item) => ({
      formationId: item.formationId,
      title: formationMap.get(item.formationId)?.title || `Formation ${item.formationId}`,
      categorie: formationMap.get(item.formationId)?.categorie || null,
      enrollments: item._count._all,
      sessions: sessionsMap.get(item.formationId) || 0,
    })),
  }
}

async function buildEnrollmentsReport(period: string) {
  const since = resolvePeriodStart(period)
  const where = since ? { createdAt: { gte: since } } : undefined
  const [totalInscriptions, pendingInscriptions, acceptedInscriptions, rejectedInscriptions, paidEnrollments] = await Promise.all([
    prisma.enrollment.count({ where }),
    prisma.enrollment.count({ where: { ...(where || {}), status: 'pending' } }),
    prisma.enrollment.count({ where: { ...(where || {}), status: { in: ['accepted', 'confirmed', 'completed'] } } }),
    prisma.enrollment.count({ where: { ...(where || {}), status: { in: ['rejected', 'cancelled'] } } }),
    prisma.enrollment.count({ where: { ...(where || {}), paymentStatus: 'paid' } }),
  ])

  return {
    totalInscriptions,
    pendingInscriptions,
    acceptedInscriptions,
    rejectedInscriptions,
    conversionRate: totalInscriptions > 0 ? Number(((acceptedInscriptions / totalInscriptions) * 100).toFixed(1)) : 0,
    paymentCompletionRate: totalInscriptions > 0 ? Number(((paidEnrollments / totalInscriptions) * 100).toFixed(1)) : 0,
  }
}

async function buildRevenueReport(period: string) {
  const since = resolvePeriodStart(period)
  const payments = await prisma.payment.findMany({
    where: since ? { createdAt: { gte: since } } : undefined,
    select: {
      amount: true,
      status: true,
      method: true,
      createdAt: true,
    },
  })

  const successful = payments.filter((payment) => toCanonicalPaymentStatus(payment.status) === 'success')
  const pending = payments.filter((payment) => toCanonicalPaymentStatus(payment.status) === 'pending')
  const failed = payments.filter((payment) => toCanonicalPaymentStatus(payment.status) === 'failed')

  const byMethod = successful.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + payment.amount
    return acc
  }, {})

  return {
    totalRevenue: successful.reduce((sum, payment) => sum + payment.amount, 0),
    pendingRevenue: pending.reduce((sum, payment) => sum + payment.amount, 0),
    failedRevenue: failed.reduce((sum, payment) => sum + payment.amount, 0),
    totalTransactions: payments.length,
    successfulTransactions: successful.length,
    paymentMethods: Object.entries(byMethod).map(([method, amount]) => ({ method, amount })),
  }
}

async function buildReport(type: 'students' | 'formations' | 'inscriptions' | 'revenue', period: string) {
  if (type === 'students') {
    return {
      title: `Rapport etudiants - ${period}`,
      description: 'Vue d ensemble des comptes etudiants et de leur activite.',
      data: await buildStudentsReport(period),
    }
  }

  if (type === 'formations') {
    return {
      title: `Rapport formations - ${period}`,
      description: 'Popularite et activation des formations sur la periode selectionnee.',
      data: await buildFormationsReport(period),
    }
  }

  if (type === 'inscriptions') {
    return {
      title: `Rapport inscriptions - ${period}`,
      description: 'Conversion des inscriptions et suivi des statuts sur la periode.',
      data: await buildEnrollmentsReport(period),
    }
  }

  return {
    title: `Rapport financier - ${period}`,
    description: 'Encaissements, paiements en attente et repartition par methode.',
    data: await buildRevenueReport(period),
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const period = request.nextUrl.searchParams.get('period') || '30d'
  const generatedAt = new Date().toISOString()
  const reports = await Promise.all(
    ['students', 'formations', 'inscriptions', 'revenue'].map(async (type) => {
      const report = await buildReport(type as 'students' | 'formations' | 'inscriptions' | 'revenue', period)
      return {
        id: `${type}-${period}`,
        title: report.title,
        description: report.description,
        type,
        generatedAt,
        preview: report.data,
      }
    }),
  )

  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = reportRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const report = await buildReport(parsed.data.type, parsed.data.period)

  return NextResponse.json({
    id: `${parsed.data.type}-${Date.now()}`,
    title: report.title,
    description: report.description,
    type: parsed.data.type,
    period: parsed.data.period,
    data: report.data,
    generatedAt: new Date().toISOString(),
  })
}
