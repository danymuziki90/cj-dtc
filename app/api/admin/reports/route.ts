import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { buildAdminReportingSnapshot, type AdminReportingSnapshot, type ReportingPeriod } from '@/lib/admin/reporting'

const reportTypeSchema = z.enum([
  'students',
  'formations',
  'inscriptions',
  'revenue',
  'fill_rate',
  'attendance',
  'submissions',
  'certificates',
  'conversion',
])

const reportRequestSchema = z.object({
  type: reportTypeSchema,
  period: z.enum(['7d', '30d', '90d', '365d', 'all']).optional().default('30d'),
})

function parsePeriod(raw: string | null): ReportingPeriod {
  if (raw === '7d' || raw === '30d' || raw === '90d' || raw === '365d' || raw === 'all') return raw
  return '30d'
}

function buildReport(type: z.infer<typeof reportTypeSchema>, snapshot: AdminReportingSnapshot) {
  const generatedAt = snapshot.generatedAt

  if (type === 'students') {
    return {
      id: `students-${snapshot.period}`,
      title: `Rapport etudiants - ${snapshot.periodLabel}`,
      description: 'Suivi du passage inscription, paiement et creation de compte etudiant.',
      type,
      generatedAt,
      preview: {
        totalEnrollments: snapshot.reports.conversion.totalEnrollments,
        studentAccounts: snapshot.reports.conversion.studentAccounts,
        accountRate: snapshot.reports.conversion.accountRate,
        blockedWithoutAccount: snapshot.reports.conversion.blockedWithoutAccount.slice(0, 5),
      },
    }
  }

  if (type === 'formations' || type === 'fill_rate') {
    return {
      id: `fill-rate-${snapshot.period}`,
      title: `Remplissage des sessions - ${snapshot.periodLabel}`,
      description: 'Taux de remplissage, capacite restante et pression liste d attente.',
      type,
      generatedAt,
      preview: {
        averageFillRate: snapshot.reports.fillRate.averageRate,
        fullSessions: snapshot.reports.fillRate.fullSessions,
        sessions: snapshot.reports.fillRate.sessions.slice(0, 8),
      },
    }
  }

  if (type === 'inscriptions') {
    return {
      id: `inscriptions-${snapshot.period}`,
      title: `Rapport inscriptions - ${snapshot.periodLabel}`,
      description: 'Pipeline inscription, paiement et comptes crees.',
      type,
      generatedAt,
      preview: {
        stages: snapshot.reports.conversion.stages,
        paymentRate: snapshot.reports.conversion.paymentRate,
        accountRate: snapshot.reports.conversion.accountRate,
        pendingPayments: snapshot.actionsNow.paymentsToValidate.slice(0, 5),
      },
    }
  }

  if (type === 'revenue') {
    return {
      id: `revenue-${snapshot.period}`,
      title: `Rapport financier - ${snapshot.periodLabel}`,
      description: 'Encaissements, attendu, reste a recouvrer et anciennete des impayes.',
      type,
      generatedAt,
      preview: snapshot.reports.revenue,
    }
  }

  if (type === 'attendance') {
    return {
      id: `attendance-${snapshot.period}`,
      title: `Rapport de presence - ${snapshot.periodLabel}`,
      description: 'Taux de presence, absences repetees et sessions a risque.',
      type,
      generatedAt,
      preview: snapshot.reports.attendance,
    }
  }

  if (type === 'submissions') {
    return {
      id: `submissions-${snapshot.period}`,
      title: `Rapport travaux - ${snapshot.periodLabel}`,
      description: 'Corrections en attente et assignments non remis.',
      type,
      generatedAt,
      preview: snapshot.reports.submissions,
    }
  }

  if (type === 'certificates') {
    return {
      id: `certificates-${snapshot.period}`,
      title: `Rapport certificats - ${snapshot.periodLabel}`,
      description: 'Certificats delivres et cohortes eligibles a servir.',
      type,
      generatedAt,
      preview: snapshot.reports.certificates,
    }
  }

  return {
    id: `conversion-${snapshot.period}`,
    title: `Rapport conversion - ${snapshot.periodLabel}`,
    description: 'Conversion inscription -> paiement -> compte etudiant.',
    type,
    generatedAt,
    preview: snapshot.reports.conversion,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const snapshot = await buildAdminReportingSnapshot(parsePeriod(request.nextUrl.searchParams.get('period')))
  const reports = [
    'fill_rate',
    'revenue',
    'attendance',
    'submissions',
    'certificates',
    'conversion',
  ].map((type) => buildReport(type as z.infer<typeof reportTypeSchema>, snapshot))

  return NextResponse.json(reports)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  const parsed = reportRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const snapshot = await buildAdminReportingSnapshot(parsed.data.period)
  const report = buildReport(parsed.data.type, snapshot)

  return NextResponse.json({
    ...report,
    period: parsed.data.period,
    data: report.preview,
    generatedAt: snapshot.generatedAt,
  })
}
