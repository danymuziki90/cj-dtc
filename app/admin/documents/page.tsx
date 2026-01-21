'use client'

import { useState, useEffect, useRef } from 'react'

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

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [filters, setFilters] = useState({
        formationId: '',
        category: '',
        isPublic: ''
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'syllabus',
        formationId: '',
        sessionId: '',
        isPublic: false
    })

    const categories = [
        { value: 'syllabus', label: 'Syllabus/Programme' },
        { value: 'presentation', label: 'Présentation' },
        { value: 'exercise', label: 'Exercice' },
        { value: 'resource', label: 'Ressource' },
        { value: 'certificate_template', label: 'Modèle de certificat' }
    ]

    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.formationId) params.append('formationId', filters.formationId)
            if (filters.category) params.append('category', filters.category)
            if (filters.isPublic) params.append('isPublic', filters.isPublic)

            const response = await fetch(`/api/documents?${params}`)
            const data = await response.json()
            setDocuments(data)
        } catch (error) {
            console.error('Erreur lors du chargement des documents:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFormations = async () => {
        try {
            const response = await fetch('/api/formations')
            const data = await response.json()
            setFormations(data)
        } catch (error) {
            console.error('Erreur lors du chargement des formations:', error)
        }
    }

    useEffect(() => {
        fetchDocuments()
        fetchFormations()
    }, [])

    useEffect(() => {
        fetchDocuments()
    }, [filters])

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        const file = fileInputRef.current?.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
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
                    category: 'syllabus',
                    formationId: '',
                    sessionId: '',
                    isPublic: false
                })
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

        try {
            // Note: Il faudrait créer une API DELETE pour les documents
            // Pour l'instant, on simule la suppression
            setDocuments(documents.filter(doc => doc.id !== id))
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
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
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Supports Pédagogiques</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    📁 Upload un document
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
            <form onSubmit={handleFileUpload} className="hidden">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                            setUploadForm(prev => ({ ...prev, title: file.name }))
                        }
                    }}
                />
            </form>

            {/* Modal d'upload */}
            {fileInputRef.current?.files?.[0] && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Upload de document</h3>

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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Formation associée
                                </label>
                                <select
                                    value={uploadForm.formationId}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, formationId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Aucune</option>
                                    {formations.map(formation => (
                                        <option key={formation.id} value={formation.id}>
                                            {formation.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={uploadForm.isPublic}
                                    onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                                    Document public (accessible aux étudiants)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
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
                                {uploading ? 'Upload en cours...' : 'Uploader'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Liste des documents */}
            <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Documents ({documents.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {documents.map((document) => (
                        <div key={document.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {document.title}
                                        </h3>
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${document.isPublic
                                                ? 'bg-green-100 text-green-800'
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
                                        <span>Upload: {new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
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
                                        📁 Voir
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
    )
}