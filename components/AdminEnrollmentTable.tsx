'use client'

import { useState } from 'react'
import EnrollmentStatusChanger from './EnrollmentStatusChanger'
import { FormattedDate } from './FormattedDate'

interface Enrollment {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
    address?: string
    startDate: string
    status: string
    paymentStatus: string
    totalAmount: number
    paidAmount: number
    createdAt: string
    motivationLetter?: string
    notes?: string
    formation: {
        id: number
        title: string
        slug: string
    }
}

interface AdminEnrollmentTableProps {
    enrollments: Enrollment[]
    groupBy: 'formation' | 'date'
    onPreview?: (enrollment: Enrollment) => void
}

const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        confirmed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-800'
    }

    const statusLabels: Record<string, string> = {
        pending: 'En attente',
        accepted: 'Acceptée',
        rejected: 'Rejetée',
        confirmed: 'Confirmée',
        cancelled: 'Annulée'
    }

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || statusClasses.pending}`}>
            {statusLabels[status] || status}
        </span>
    )
}

const getMimeType = (base64String: string): string => {
    if (base64String.startsWith('data:application/pdf')) return 'application/pdf'
    if (base64String.startsWith('data:application/msword')) return 'application/msword'
    if (base64String.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (base64String.startsWith('data:text/plain')) return 'text/plain'
    return 'application/octet-stream'
}

const downloadMotivationLetter = (motivationLetter: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = motivationLetter
    link.download = `${fileName}_motivation.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export default function AdminEnrollmentTable({ enrollments: initialEnrollments, groupBy, onPreview }: AdminEnrollmentTableProps) {
    const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments)

    const handleStatusChanged = (enrollmentId: number, newStatus: string) => {
        setEnrollments(prevEnrollments =>
            prevEnrollments.map(enrollment =>
                enrollment.id === enrollmentId
                    ? { ...enrollment, status: newStatus }
                    : enrollment
            )
        )
    }

    if (groupBy === 'formation') {
        const byFormation = enrollments.reduce((acc: Record<number, Enrollment[]>, enrollment) => {
            const formationId = enrollment.formation.id
            if (!acc[formationId]) {
                acc[formationId] = []
            }
            acc[formationId].push(enrollment)
            return acc
        }, {})

        return (
            <div className="space-y-6">
                {Object.entries(byFormation).map(([formationId, formationEnrollments]: [string, Enrollment[]]) => (
                    <div key={formationId} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4">
                            {formationEnrollments[0]?.formation.title} ({formationEnrollments.length})
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="text-left p-2">Nom</th>
                                        <th className="text-left p-2">Email</th>
                                        <th className="text-left p-2">Téléphone</th>
                                        <th className="text-left p-2">Adresse</th>
                                        <th className="text-left p-2">Date de début</th>
                                        <th className="text-left p-2">Statut</th>
                                        <th className="text-left p-2">Lettre de motivation</th>
                                        <th className="text-left p-2">Date d'inscription</th>
                                        {onPreview && <th className="text-left p-2">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formationEnrollments.map((enrollment: Enrollment) => (
                                        <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                {enrollment.firstName} {enrollment.lastName}
                                            </td>
                                            <td className="p-2">{enrollment.email}</td>
                                            <td className="p-2">{enrollment.phone || '—'}</td>
                                            <td className="p-2 text-xs text-gray-600">{enrollment.address || '—'}</td>
                                            <td className="p-2">
                                                <FormattedDate date={enrollment.startDate} />
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(enrollment.status)}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                {enrollment.motivationLetter ? (
                                                    <button
                                                        onClick={() =>
                                                            downloadMotivationLetter(
                                                                enrollment.motivationLetter!,
                                                                `${enrollment.firstName}_${enrollment.lastName}`
                                                            )
                                                        }
                                                        className="text-cjblue hover:text-cjred underline text-xs"
                                                    >
                                                        Télécharger
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <FormattedDate date={enrollment.createdAt} />
                                            </td>
                                            <td className="p-2">
                                                {onPreview && (
                                                    <button
                                                        onClick={() => onPreview(enrollment)}
                                                        className="text-cjblue hover:text-cjred underline text-xs"
                                                        title="Prévisualiser"
                                                    >
                                                        👁️
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        )
    } else {
        // Grouper par date de début
        const byStartDate = enrollments.reduce((acc: Record<string, Enrollment[]>, enrollment) => {
            const dateObj = typeof enrollment.startDate === 'string'
                ? new Date(enrollment.startDate)
                : enrollment.startDate
            const dateKey = dateObj instanceof Date
                ? dateObj.toISOString().split('T')[0]
                : enrollment.startDate.split('T')[0]
            if (!acc[dateKey]) {
                acc[dateKey] = []
            }
            acc[dateKey].push(enrollment)
            return acc
        }, {})

        return (
            <div className="space-y-6">
                {Object.entries(byStartDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([dateKey, dateEnrollments]: [string, Enrollment[]]) => (
                        <div key={dateKey} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-4">
                                <FormattedDate date={dateKey} options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as any} />
                                ({dateEnrollments.length})
                            </h4>
                            <div className="space-y-3">
                                {dateEnrollments.map((enrollment: Enrollment) => (
                                    <div key={enrollment.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded border">
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {enrollment.firstName} {enrollment.lastName}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                <div>{enrollment.formation.title}</div>
                                                <div>{enrollment.email}</div>
                                                {enrollment.address && <div className="text-xs text-gray-500">{enrollment.address}</div>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            {onPreview && (
                                                <button
                                                    onClick={() => onPreview(enrollment)}
                                                    className="text-cjblue hover:text-cjred text-sm"
                                                    title="Prévisualiser"
                                                >
                                                    👁️
                                                </button>
                                            )}
                                            {enrollment.motivationLetter && (
                                                <button
                                                    onClick={() =>
                                                        downloadMotivationLetter(
                                                            enrollment.motivationLetter!,
                                                            `${enrollment.firstName}_${enrollment.lastName}`
                                                        )
                                                    }
                                                    className="text-cjblue hover:text-cjred underline text-xs"
                                                >
                                                    📄
                                                </button>
                                            )}
                                            <EnrollmentStatusChanger
                                                enrollmentId={enrollment.id}
                                                currentStatus={enrollment.status}
                                                email={enrollment.email}
                                                formationTitle={enrollment.formation.title}
                                                onStatusChanged={(newStatus) => handleStatusChanged(enrollment.id, newStatus)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        )
    }
}
