import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const formationId = searchParams.get('formationId')

        // Construction des filtres de date
        const dateFilter: any = {}
        if (startDate) {
            dateFilter.gte = new Date(startDate)
        }
        if (endDate) {
            dateFilter.lte = new Date(endDate)
        }

        const whereClause: any = {}
        if (Object.keys(dateFilter).length > 0) {
            whereClause.createdAt = dateFilter
        }
        if (formationId) {
            whereClause.formationId = parseInt(formationId)
        }

        // Récupération des données d'inscription
        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                address: true,
                formationId: true,
                startDate: true,
                status: true,
                paymentStatus: true,
                totalAmount: true,
                paidAmount: true,
                paymentMethod: true,
                paymentDate: true,
                certificateIssued: true,
                source: true,
                insertionResult: true,
                createdAt: true,
                updatedAt: true,
                formation: {
                    select: { id: true, title: true }
                }
            }
        })

        // Statistiques générales
        const totalEnrollments = enrollments.length
        const confirmedEnrollments = enrollments.filter((e: any) =>
            ['confirmed', 'completed'].includes(e.status)
        ).length

        const totalRevenue = enrollments.reduce((sum: number, e: any) => sum + (e.totalAmount || 0), 0)
        const paidRevenue = enrollments.reduce((sum: number, e: any) => sum + (e.paidAmount || 0), 0)
        const conversionRate = totalEnrollments > 0 ? (confirmedEnrollments / totalEnrollments) * 100 : 0

        // Popularité des formations
        const formationStats = enrollments.reduce((acc: any, enrollment: any) => {
            const formationId = enrollment.formationId
            const formationTitle = enrollment.formation.title

            if (!acc[formationId]) {
                acc[formationId] = {
                    id: formationId,
                    title: formationTitle,
                    enrollments: 0,
                    revenue: 0,
                    confirmed: 0
                }
            }

            acc[formationId].enrollments++
            acc[formationId].revenue += enrollment.totalAmount || 0
            if (['confirmed', 'completed'].includes(enrollment.status)) {
                acc[formationId].confirmed++
            }

            return acc
        }, {} as Record<number, any>)

        const formationsPopularity = Object.values(formationStats)
            .sort((a: any, b: any) => b.enrollments - a.enrollments)

        // Tendances mensuelles
        const monthlyTrends = []
        const now = new Date()
        const startMonth = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endMonth = endDate ? new Date(endDate) : now

        for (let date = new Date(startMonth); date <= endMonth; date.setMonth(date.getMonth() + 1)) {
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1)

            const monthEnrollments = enrollments.filter((e: any) =>
                e.createdAt >= monthStart && e.createdAt < monthEnd
            )

            monthlyTrends.push({
                month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
                monthLabel: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                enrollments: monthEnrollments.length,
                revenue: monthEnrollments.reduce((sum: number, e: any) => sum + (e.totalAmount || 0), 0),
                confirmed: monthEnrollments.filter((e: any) => ['confirmed', 'completed'].includes(e.status)).length
            })
        }

        // Répartition par source
        const sourceStats = enrollments.reduce((acc: any, e: any) => {
            const source = e.source || 'unknown'
            acc[source] = (acc[source] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const sourceBreakdown = Object.entries(sourceStats).map(([source, count]) => ({
            source,
            sourceLabel: getSourceLabel(source),
            count: count as number,
            percentage: totalEnrollments > 0 ? ((count as number) / totalEnrollments) * 100 : 0
        })).sort((a, b) => b.count - a.count)

        // Répartition par statut
        const statusStats = enrollments.reduce((acc: any, e: any) => {
            acc[e.status] = (acc[e.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const statusBreakdown = Object.entries(statusStats).map(([status, count]) => ({
            status,
            statusLabel: getStatusLabel(status),
            count: count as number,
            percentage: totalEnrollments > 0 ? ((count as number) / totalEnrollments) * 100 : 0
        })).sort((a, b) => b.count - a.count)

        // Statistiques d'insertion professionnelle
        const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed')
        const placedEnrollments = completedEnrollments.filter((e: any) => e.insertionResult === 'placed')

        const insertionStats = {
            totalCompleted: completedEnrollments.length,
            placed: placedEnrollments.length,
            placementRate: completedEnrollments.length > 0 ? (placedEnrollments.length / completedEnrollments.length) * 100 : 0
        }

        // Statistiques de paiement
        const paymentStats = enrollments.reduce((acc: any, e: any) => {
            const status = e.paymentStatus || 'unpaid'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const paymentBreakdown = Object.entries(paymentStats).map(([status, count]) => ({
            status,
            statusLabel: getPaymentStatusLabel(status),
            count: count as number,
            percentage: totalEnrollments > 0 ? ((count as number) / totalEnrollments) * 100 : 0
        })).sort((a, b) => b.count - a.count)

        return NextResponse.json({
            summary: {
                totalEnrollments,
                confirmedEnrollments,
                totalRevenue,
                paidRevenue,
                conversionRate
            },
            formationsPopularity,
            monthlyTrends,
            sourceBreakdown,
            statusBreakdown,
            insertionStats,
            paymentBreakdown,
            filters: {
                startDate,
                endDate,
                formationId
            }
        })

    } catch (error) {
        console.error('Erreur lors de la récupération des analytics:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des données analytics' },
            { status: 500 }
        )
    }
}

function getSourceLabel(source: string): string {
    const labels: Record<string, string> = {
        website: 'Site web',
        social_media: 'Réseaux sociaux',
        referral: 'Recommandation',
        search_engine: 'Moteur de recherche',
        advertisement: 'Publicité',
        other: 'Autre',
        unknown: 'Non spécifié'
    }
    return labels[source] || source
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'En attente',
        accepted: 'Acceptée',
        confirmed: 'Confirmée',
        rejected: 'Rejetée',
        cancelled: 'Annulée',
        completed: 'Terminée'
    }
    return labels[status] || status
}

function getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        unpaid: 'Non payé',
        partial: 'Partiellement payé',
        paid: 'Payé'
    }
    return labels[status] || status
}