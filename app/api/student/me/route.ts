
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyStudentToken } from '@/lib/auth-portal/jwt'
import { cookies } from 'next/headers'

export const runtime = "nodejs"

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('student-token')?.value || cookieStore.get('student_token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        const payload = await verifyStudentToken(token)
        if (!payload || !payload.username) {
            return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
        }

        const student = await prisma.student.findUnique({
            where: { email: payload.username },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                studentNumber: true,
                status: true,
                phone: true,
                address: true,
                city: true,
                country: true,
                createdAt: true
            }
        })

        if (!student) {
            return NextResponse.json({ error: 'Étudiant introuvable' }, { status: 404 })
        }

        // Mock stats for now (until we have real enrollments/grades)
        const stats = {
            ...student,
            totalFormations: 2,
            activeFormations: 1,
            completedFormations: 1,
            pendingAssignments: 3,
            unreadMessages: 2,
            averageGrade: 85,
            nextExam: {
                title: "Introduction au Droit",
                date: "25 Jan 2026",
                timeLeft: "2 jours"
            },
            recentActivity: [
                { type: 'assignment', title: 'TP Dr. Civil', date: 'Hier', status: 'submitted' },
                { type: 'grade', title: 'Quiz Marketing', date: 'Il y a 2 jours', status: 'completed' }
            ]
        }

        return NextResponse.json(stats)

    } catch (error) {
        console.error('Dashboard error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
