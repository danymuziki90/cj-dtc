'use client'

import { useState, useEffect, useRef } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

interface Document {
    id: number
    title: string
    description?: string
    fileName: string
    filePath: string
    fileSize: number
    mimeType: string
    category: string
    isPublic: boolean
    formation?: {
        id: number
        title: string
    }
    session?: {
        id: number
        startDate: string
        location: string
    }
    createdAt: string
}

interface Formation {
    id: number
    title: string
}

interface TrainingSession { id: number; formationId: number; startDate: string; endDate: string; formation: { title: string } }

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [formations, setFormations] = useState<Formation[]>([])
    const [sessions, setSessions] = useState<TrainingSession[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [filters, setFilters] = useState({
        formationId: '',
        category: '',
        isPublic: ''
    })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'cours',
        formationId: '',
        sessionId: '',
        isPublic: true
    })

    const categories = [
        { value: 'cours', label: 'Cours' },
        { value: 'tp', label: 'TP / exercice pratique' },
        { value: 'guide', label: 'Guide' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'exercise', label: 'Exercice' },
        { value: 'video', label: 'Vidéo' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'ressource', label: 'Ressource complémentaire' }
    ]

    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.formationId) params.append('formationId', filters.formationId)
            if (filters.category) params.append('category', filters.category)
            if (filters.isPublic) params.append('isPublic', filters.isPublic)

            const response = await fetch(`/api/documents?${params}`)
            const data = await response.json()
            setDocuments(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Impossible de charger les documents:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFormations = async () => {
        try {
            const response = await fetch('/api/formations')
            const data = await response.json()
            // /api/formations returns { formations, stats? }; normalise the
            // payload before rendering select options.
            setFormations(Array.isArray(data) ? data : (Array.isArray(data?.formations) ? data.formations : []))
        } catch (error) {
            console.error('Impossible de charger les formations:', error)
        }
    }

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/sessions')
            const data = await response.json()
            setSessions(Array.isArray(data) ? data : (Array.isArray(data?.sessions) ? data.sessions : []))
        } catch (error) { console.error('Impossible de charger les sessions:', error) }
    }

    useEffect(() => {
        fetchDocuments()
        fetchFormations()
        fetchSessions()
    }, [])

    useEffect(() => {
        fetchDocuments()
    }, [filters])

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) return

        setUploading(true)
        setError(null)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('title', uploadForm.title)
            formData.append('description', uploadForm.description)
            formData.append('category', uploadForm.category)
            formData.append('formationId', uploadForm.formationId)
            formData.append('sessionId', uploadForm.sessionId)
            formData.append('isPublic', uploadForm.isPublic.toString())

            const response = await fetch('/api/documents', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                fetchDocuments()
                setUploadForm({
                    title: '',
                    description: '',
                    category: 'cours',
                    formationId: '',
                    sessionId: '',
                    isPublic: true
                })
                setSelectedFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            } else {
                let errMsg = "Erreur lors de l'importation."
                try {
                    const data = await response.json()
                    errMsg = data.error || errMsg
                } catch (jsonErr) {
                    const text = await response.text().catch(() => '')
                    errMsg = `Erreur serveur R2 (${response.status}): ${response.statusText || 'Internal Server Error'}. ${text.slice(0, 150)}`
                }
                console.error("[DocumentsPage] Échec de l'upload:", errMsg)
                setError(errMsg)
            }
        } catch (error: any) {
            console.error('Impossible d\'importer le document:', error)
            setError(error.message || "Erreur réseau lors de l'importation.")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer ce document ?')) return

        try {
            const response = await fetch(`/api/documents/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => null)
                throw new Error(payload?.error || 'Suppression impossible')
            }

            setDocuments((current) => current.filter(doc => doc.id !== id))
        } catch (error) {
            console.error('Impossible de supprimer le document:', error)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getCategoryLabel = (category: string) => {
        return categories.find(cat => cat.value === category)?.label || category
    }

    if (loading) {
        return (
            <AdminShell title="Documents">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </AdminShell>
        )
    }

    return (
        <AdminShell title="Supports pedagogiques">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Bibliotheque documentaire</h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Ajouter un document
                </button>
            </div>

            {/* Filtres */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Formation
                        </label>
                        <select
                            value={filters.formationId}
                            onChange={(e) => setFilters(prev => ({ ...prev, formationId: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les formations</option>
                            {formations.map(formation => (
                                <option key={formation.id} value={formation.id}>
                                    {formation.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catégorie
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibilité
                        </label>
                        <select
                            value={filters.isPublic}
                            onChange={(e) => setFilters(prev => ({ ...prev, isPublic: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tous</option>
                            <option value="true">Public</option>
                            <option value="false">Privé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Formulaire d'upload caché */}
            <div className="hidden">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            setSelectedFile(file)
                            setUploadForm(prev => ({ ...prev, title: file.name }))
                        }
                    }}
                />
            </div>

            {/* Modal d'upload */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <form onSubmit={handleFileUpload} className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Importer un document</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catégorie *
                                </label>
                                <select
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session associée *</label>
                                <select required value={uploadForm.sessionId} onChange={(e) => { const target = sessions.find((session) => session.id === Number(e.target.value)); setUploadForm(prev => ({ ...prev, sessionId: e.target.value, formationId: target ? String(target.formationId) : prev.formationId })) }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Sélectionner une session</option>
                                    {sessions.map(session => <option key={session.id} value={session.id}>{session.formation?.title || 'Formation'} — {new Date(session.startDate).toLocaleDateString('fr-FR')}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null)
                                    setError(null)
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = ''
                                    }
                                    setUploadForm({
                                        title: '',
                                        description: '',
                                        category: 'syllabus',
                                        formationId: '',
                                        sessionId: '',
                                        isPublic: false
                                    })
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {uploading ? 'Import en cours...' : 'Enregistrer le document'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* Liste des documents */}
            <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Documents disponibles ({documents.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {documents.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-gray-500">
                            Aucun document ne correspond aux filtres actuels.
                        </div>
                    ) : documents.map((document) => (
                        <div key={document.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {document.title}
                                        </h3>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${document.isPublic
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {document.isPublic ? 'Public' : 'Privé'}
                                        </span>
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {getCategoryLabel(document.category)}
                                        </span>
                                    </div>

                                    {document.description && (
                                        <p className="mt-1 text-sm text-gray-600">{document.description}</p>
                                    )}

                                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                        <span>Fichier: {document.fileName}</span>
                                        <span>Taille: {formatFileSize(document.fileSize)}</span>
                                        <span>Ajoute le: {new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>

                                    {document.formation && (
                                        <div className="mt-2">
                                            <span className="text-sm text-gray-600">
                                                Formation: <span className="font-medium">{document.formation.title}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2 ml-4">
                                    <a
                                        href={`/${document.filePath}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                    >
                                        Ouvrir
                                    </a>
                                    <button
                                        onClick={() => handleDelete(document.id)}
                                        className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </AdminShell>
    )
}
