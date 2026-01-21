'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SessionCapacityManager from '../../../../components/SessionCapacityManager'
import AttendanceManager from '../../../../components/AttendanceManager'
import StudentProgressTracker from '../../../../components/StudentProgressTracker'

interface Session {
    id: number
    formationId: number
    formationTitle: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    location: string
    format: 'presentiel' | 'distanciel' | 'hybride'
    maxParticipants: number
    currentParticipants: number
    price: number
    status: 'ouverte' | 'fermee' | 'complete' | 'annulee' | 'terminee'
    description?: string
    prerequisites?: string
    objectives?: string
    createdAt: string
}

interface Participant {
    id: number
    name: string
    email: string
    phone: string
    registrationDate: string
    paymentStatus: 'paye' | 'partiel' | 'impaye'
    attendanceStatus: 'present' | 'absent' | 'en_cours'
}

export default function SessionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const sessionId = params.id as string

    const [session, setSession] = useState<Session | null>(null)
    const [participants, setParticipants] = useState<Participant[]>([])
    const [loading, setLoading] = useState(true)

    // Mock data
    const mockSession: Session = {
        id: parseInt(sessionId),
        formationId: 1,
        formationTitle: 'Management des Ressources Humaines (MRH)',
        startDate: '2026-02-15',
        endDate: '2026-02-20',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Kinshasa, RDC',
        format: 'presentiel',
        maxParticipants: 25,
        currentParticipants: 18,
        price: 150000,
        status: 'ouverte',
        description: 'Session intensive de formation en Management des Ressources Humaines avec focus sur les pratiques africaines.',
        prerequisites: 'Diplôme de niveau Bac+3 minimum, expérience professionnelle souhaitée.',
        objectives: 'Maîtriser les fondamentaux du MRH, développer des compétences en recrutement et gestion des talents.',
        createdAt: '2026-01-10'
    }

    const mockParticipants: Participant[] = [
        {
            id: 1,
            name: 'Marie Kabila',
            email: 'marie.kabila@email.com',
            phone: '+243 81 234 5678',
            registrationDate: '2026-01-15',
            paymentStatus: 'paye',
            attendanceStatus: 'en_cours'
        },
        {
            id: 2,
            name: 'Jean-Pierre Mbeki',
            email: 'jp.mbeki@email.com',
            phone: '+243 82 345 6789',
            registrationDate: '2026-01-12',
            paymentStatus: 'paye',
            attendanceStatus: 'en_cours'
        },
        {
            id: 3,
            name: 'Sophie Nkosi',
            email: 'sophie.nkosi@email.com',
            phone: '+243 83 456 7890',
            registrationDate: '2026-01-20',
            paymentStatus: 'partiel',
            attendanceStatus: 'en_cours'
        }
    ]

    useEffect(() => {
        // Simulation du chargement
        setTimeout(() => {
            setSession(mockSession)
            setParticipants(mockParticipants)
            setLoading(false)
        }, 1000)
    }, [sessionId])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ouverte': return 'bg-green-100 text-green-800'
            case 'fermee': return 'bg-red-100 text-red-800'
            case 'complete': return 'bg-yellow-100 text-yellow-800'
            case 'annulee': return 'bg-gray-100 text-gray-800'
            case 'terminee': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paye': return 'bg-green-100 text-green-800'
            case 'partiel': return 'bg-yellow-100 text-yellow-800'
            case 'impaye': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getAttendanceStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800'
            case 'absent': return 'bg-red-100 text-red-800'
            case 'en_cours': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'presentiel': return '🏢'
            case 'distanciel': return '💻'
            case 'hybride': return '🔄'
            default: return '📅'
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="h-40 bg-gray-200 rounded"></div>
                            <div className="h-60 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-80 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">Session non trouvée.</p>
                    <Link href="/admin/sessions" className="text-blue-600 hover:text-blue-800">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/admin/sessions"
                    className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
                >
                    ← Retour aux sessions
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{session.formationTitle}</h1>
                        <p className="text-gray-600 mt-1">Session #{session.id}</p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={`/admin/sessions/${session.id}/edit`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Modifier
                        </Link>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Détails de la session */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails de la session</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Dates et horaires</h3>
                                <p className="text-gray-900">
                                    Du {new Date(session.startDate).toLocaleDateString('fr-FR')} au {new Date(session.endDate).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {session.startTime} - {session.endTime}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Format et lieu</h3>
                                <div className="flex items-center">
                                    <span className="text-lg mr-2">{getFormatIcon(session.format)}</span>
                                    <span className="text-gray-900 capitalize">{session.format}</span>
                                </div>
                                <p className="text-gray-600 text-sm">{session.location}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Participants</h3>
                                <p className="text-gray-900">
                                    {session.currentParticipants}/{session.maxParticipants} inscrits
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${(session.currentParticipants / session.maxParticipants) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Prix</h3>
                                <p className="text-gray-900 font-semibold">
                                    {session.price.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(session.status)}`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Description, prérequis, objectifs */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations détaillées</h2>
                        <div className="space-y-4">
                            {session.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                                    <p className="text-gray-900">{session.description}</p>
                                </div>
                            )}
                            {session.prerequisites && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Prérequis</h3>
                                    <p className="text-gray-900">{session.prerequisites}</p>
                                </div>
                            )}
                            {session.objectives && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Objectifs</h3>
                                    <p className="text-gray-900">{session.objectives}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Participants</h2>
                        <span className="text-sm text-gray-500">
                            {participants.length}/{session.maxParticipants}
                        </span>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {participants.map((participant) => (
                            <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">{participant.name}</h3>
                                    <div className="flex space-x-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(participant.paymentStatus)}`}>
                                            {participant.paymentStatus}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceStatusColor(participant.attendanceStatus)}`}>
                                            {participant.attendanceStatus}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{participant.email}</p>
                                <p className="text-sm text-gray-600">{participant.phone}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Inscrit le {new Date(participant.registrationDate).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        ))}
                    </div>

                    {participants.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Aucun participant inscrit</p>
                    )}

                    <div className="mt-4 pt-4 border-t">
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Gérer les inscriptions
                        </button>
                    </div>
                </div>
            </div>

            {/* Gestion de capacité */}
            <div className="mt-6">
                <SessionCapacityManager
                    session={{
                        id: session.id,
                        formationId: session.formationId,
                        formationTitle: session.formationTitle,
                        startDate: session.startDate,
                        endDate: session.endDate,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        location: session.location,
                        format: session.format,
                        maxParticipants: session.maxParticipants,
                        currentParticipants: session.currentParticipants,
                        price: session.price,
                        status: session.status,
                        createdAt: session.createdAt
                    }}
                    onUpdate={() => {
                        // Recharger les données
                        window.location.reload()
                    }}
                />
            </div>

            {/* Gestion des présences */}
            <div className="mt-6">
                <AttendanceManager
                    sessionId={session.id}
                    participants={participants.map(p => ({
                        id: p.id,
                        enrollmentId: p.id,
                        firstName: p.name.split(' ')[0],
                        lastName: p.name.split(' ').slice(1).join(' '),
                        email: p.email,
                        attendance: []
                    }))}
                    sessionDates={(() => {
                        const dates: string[] = []
                        const start = new Date(session.startDate)
                        const end = new Date(session.endDate)
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            dates.push(d.toISOString().split('T')[0])
                        }
                        return dates
                    })()}
                    onUpdate={() => {
                        // Recharger les données
                        window.location.reload()
                    }}
                />
            </div>

            {/* Suivi de progression */}
            <div className="mt-6">
                <StudentProgressTracker
                    sessionId={session.id}
                    progresses={participants.map(p => ({
                        enrollmentId: p.id,
                        studentName: p.name,
                        email: p.email,
                        modulesCompleted: Math.floor(Math.random() * 10),
                        totalModules: 10,
                        assignmentsSubmitted: Math.floor(Math.random() * 5),
                        totalAssignments: 5,
                        attendanceRate: Math.floor(Math.random() * 40) + 60,
                        overallProgress: Math.floor(Math.random() * 40) + 60,
                        lastActivity: p.registrationDate
                    }))}
                />
            </div>

            {/* Actions supplémentaires */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        📧 Envoyer un email aux participants
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📄 Générer la liste d'émargement
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        📊 Exporter les données
                    </button>
                </div>
            </div>
        </div>
    )
}