'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SessionCapacityManager from '../../../../components/SessionCapacityManager'
import AttendanceManager from '../../../../components/AttendanceManager'
import StudentProgressTracker from '../../../../components/StudentProgressTracker'
import { FormattedDate } from '@/components/FormattedDate'
import { Plus, Trash2, Loader2, Download, BookOpen, Layers3, Video, FileArchive, FileText } from 'lucide-react'

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

    // Supports pédagogiques de la session
    const [sessionDocs, setSessionDocs] = useState<any[]>([])
    const [docsLoading, setDocsLoading] = useState(true)
    const [uploadingDoc, setUploadingDoc] = useState(false)
    const [newDocForm, setNewDocForm] = useState({ title: '', description: '', category: 'pdf' })
    const [newDocFile, setNewDocFile] = useState<File | null>(null)
    const [docErr, setDocErr] = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) return
        setDocsLoading(true)
        fetch(`/api/documents?sessionId=${sessionId}`)
            .then(res => res.json())
            .then(data => setSessionDocs(data))
            .catch(err => console.error(err))
            .finally(() => setDocsLoading(false))
    }, [sessionId])

    const handleDocUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDocFile || !sessionId) return
        setUploadingDoc(true)
        setDocErr(null)
        try {
            const formData = new FormData()
            formData.append('file', newDocFile)
            formData.append('title', newDocForm.title)
            formData.append('description', newDocForm.description)
            formData.append('category', newDocForm.category)
            formData.append('sessionId', sessionId)
            formData.append('isPublic', 'true')

            const res = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setSessionDocs(prev => [data, ...prev])
                setNewDocFile(null)
                setNewDocForm({ title: '', description: '', category: 'pdf' })
                const input = document.getElementById('detail-doc-file-input') as HTMLInputElement
                if (input) input.value = ''
            } else {
                const data = await res.json().catch(() => ({}))
                setDocErr(data.error || "Erreur lors du téléversement")
            }
        } catch (err: any) {
            setDocErr(err.message || "Erreur réseau")
        } finally {
            setUploadingDoc(false)
        }
    }

    const handleDocDelete = async (docId: number) => {
        if (!confirm("Supprimer ce support pédagogique ?")) return
        try {
            const res = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setSessionDocs(prev => prev.filter(d => d.id !== docId))
            } else {
                const data = await res.json().catch(() => ({}))
                alert(data.error || "Impossible de supprimer le document")
            }
        } catch (err) {
            alert("Erreur lors de la suppression")
        }
    }

    useEffect(() => {
        if (!sessionId) return
        setLoading(true)
        fetch(`/api/sessions/${sessionId}`)
            .then(res => {
                if (!res.ok) throw new Error("Erreur de chargement")
                return res.json()
            })
            .then(data => {
                const parsedSession = {
                    ...data,
                    formationTitle: data.formation?.title || "Formation",
                    price: data.price || 0,
                    startDate: data.startDate,
                    endDate: data.endDate,
                }
                setSession(parsedSession)
                
                const parsedParticipants = (data.enrollments || []).map((e: any) => ({
                    id: e.id,
                    name: `${e.firstName} ${e.lastName}`,
                    email: e.email,
                    phone: e.phone || '',
                    registrationDate: e.createdAt,
                    paymentStatus: 'paye',
                    attendanceStatus: 'en_cours'
                }))
                setParticipants(parsedParticipants)
            })
            .catch(err => {
                console.error(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [sessionId])

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette session ?\nCette opération est irréversible.")) return
        try {
            const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Erreur lors de la suppression")
            router.push('/admin/sessions')
        } catch (error) {
            console.error(error)
            alert("Erreur lors de la suppression de la session")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ouverte': return 'bg-blue-100 text-blue-800'
            case 'fermee': return 'bg-red-100 text-red-800'
            case 'complete': return 'bg-red-100 text-red-800'
            case 'annulee': return 'bg-gray-100 text-gray-800'
            case 'terminee': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paye': return 'bg-blue-100 text-blue-800'
            case 'partiel': return 'bg-red-100 text-red-800'
            case 'impaye': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getAttendanceStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-blue-100 text-blue-800'
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
                        Retour aux sessions
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full p-6">
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
                            href={`/admin/sessions/${session.id}/events`}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center"
                        >
                            📅 Gérer l'agenda
                        </Link>
                        <Link
                            href={`/admin/sessions/${session.id}/form-answers`}
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-semibold flex items-center"
                        >
                            📋 Réponses formulaire
                        </Link>
                        <Link
                            href="/admin/sessions"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center"
                        >
                            Modifier
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
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
                                    Du <FormattedDate date={session.startDate} /> au <FormattedDate date={session.endDate} />
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
                                    {session.price.toLocaleString('fr-FR')} USD
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

                    {/* Supports Pédagogiques */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">📚 Supports pédagogiques</h2>
                            <span className="text-sm font-semibold text-gray-500">
                                {sessionDocs.length} support(s)
                            </span>
                        </div>

                        {/* Formulaire d'ajout direct */}
                        <form onSubmit={handleDocUpload} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800">Ajouter un support à cette session</h3>
                            
                            {docErr && (
                                <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                                    {docErr}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fichier *</label>
                                    <input
                                        id="detail-doc-file-input"
                                        type="file"
                                        required
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setNewDocFile(file)
                                                if (!newDocForm.title) {
                                                    setNewDocForm(prev => ({ ...prev, title: file.name.split('.').slice(0, -1).join('.') }))
                                                }
                                            }
                                        }}
                                        className="w-full text-xs font-semibold text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type de ressource *</label>
                                    <select
                                        value={newDocForm.category}
                                        onChange={(e) => setNewDocForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-1.5 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-700"
                                    >
                                        <option value="pdf">Document PDF</option>
                                        <option value="word">Document Word</option>
                                        <option value="powerpoint">Présentation (PowerPoint)</option>
                                        <option value="zip">Archive ZIP</option>
                                        <option value="video">Support Vidéo</option>
                                        <option value="other">Autre ressource</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDocForm.title}
                                        onChange={(e) => setNewDocForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="ex. Exercice pratique - Module 2"
                                        className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-800"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description (optionnelle)</label>
                                    <input
                                        type="text"
                                        value={newDocForm.description}
                                        onChange={(e) => setNewDocForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="ex. Consignes et fichiers de départ pour l'atelier dirigé"
                                        className="w-full px-3 py-2 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={uploadingDoc || !newDocFile}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                                >
                                    {uploadingDoc ? (
                                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Envoi...</>
                                    ) : (
                                        <><Plus className="h-3.5 w-3.5" /> Ajouter à la session</>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Liste des supports pédagogiques */}
                        {docsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : sessionDocs.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">
                                Aucun support lié à cette session.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sessionDocs.map((doc) => {
                                    const fileLabels: Record<string, string> = {
                                        pdf: 'PDF',
                                        word: 'Word',
                                        powerpoint: 'PowerPoint',
                                        zip: 'ZIP',
                                        video: 'Vidéo',
                                        other: 'Autre',
                                    }
                                    return (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition">
                                            <div className="min-w-0 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-[10px] font-bold text-gray-500 uppercase">
                                                        {fileLabels[doc.category] || doc.category}
                                                    </span>
                                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                                                </div>
                                                {doc.description && (
                                                    <p className="text-xs text-gray-650 mt-1 truncate">{doc.description}</p>
                                                )}
                                                <p className="text-[11px] text-gray-450 mt-0.5 font-medium">
                                                    {doc.fileName} ({parseFloat((doc.fileSize / (1024 * 1024)).toFixed(2))} Mo)
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 transition"
                                                    title="Télécharger"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDocDelete(doc.id)}
                                                    className="p-2 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg text-gray-400 hover:text-red-700 transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
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
                                    Inscrit le <FormattedDate date={participant.registrationDate} />
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
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📧 Envoyer un email aux participants
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📄 Générer la liste d'émargement
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        📊 Exporter les données
                    </button>
                </div>
            </div>
        </div>
    )
}
