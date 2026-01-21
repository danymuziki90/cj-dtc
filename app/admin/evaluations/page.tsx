'use client'

import { useState, useEffect } from 'react'

interface Evaluation {
    id: number
    overallRating: number
    overallComment?: string
    contentRating?: number
    instructorRating?: number
    materialRating?: number
    organizationRating?: number
    facilityRating?: number
    strengths?: string
    improvements?: string
    recommendations?: string
    submittedAt: string
    isAnonymous: boolean
    enrollment: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
    formation: {
        id: number
        title: string
    }
    session?: {
        id: number
        startDate: string
        location: string
    }
}

interface Formation {
    id: number
    title: string
}

export default function EvaluationsPage() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([])
    const [formations, setFormations] = useState<Formation[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        formationId: '',
        minRating: '',
        maxRating: ''
    })

    const fetchEvaluations = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.formationId) params.append('formationId', filters.formationId)

            const response = await fetch(`/api/evaluations?${params}`)
            const data = await response.json()
            setEvaluations(data)
        } catch (error) {
            console.error('Erreur lors du chargement des évaluations:', error)
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
        fetchEvaluations()
        fetchFormations()
    }, [])

    useEffect(() => {
        fetchEvaluations()
    }, [filters])

    const getAverageRating = (evaluations: Evaluation[]) => {
        if (evaluations.length === 0) return 0
        const sum = evaluations.reduce((acc, evaluation) => acc + evaluation.overallRating, 0)
        return (sum / evaluations.length).toFixed(1)
    }

    const getRatingDistribution = (evaluations: Evaluation[]) => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        evaluations.forEach(evaluation => {
            distribution[evaluation.overallRating as keyof typeof distribution]++
        })
        return distribution
    }

    const renderStars = (rating: number) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating)
    }

    const filteredEvaluations = evaluations.filter(evaluation => {
        if (filters.minRating && evaluation.overallRating < parseInt(filters.minRating)) return false
        if (filters.maxRating && evaluation.overallRating > parseInt(filters.maxRating)) return false
        return true
    })

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const distribution = getRatingDistribution(filteredEvaluations)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Évaluations & Satisfaction</h1>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Évaluations</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredEvaluations.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                            <p className="text-2xl font-bold text-gray-900">{getAverageRating(filteredEvaluations)}/5</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredEvaluations.length > 0
                                    ? `${((filteredEvaluations.filter(e => e.overallRating >= 4).length / filteredEvaluations.length) * 100).toFixed(0)}%`
                                    : '0%'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Commentaires</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {filteredEvaluations.filter(e => e.overallComment || e.strengths || e.improvements).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Distribution des notes */}
            <div className="bg-white p-6 rounded-lg shadow border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribution des Notes</h2>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 w-8">{rating}★</span>
                            <div className="flex-1 mx-4">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-yellow-400 h-3 rounded-full"
                                        style={{
                                            width: `${filteredEvaluations.length > 0 ? (distribution[rating as keyof typeof distribution] / filteredEvaluations.length) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                {distribution[rating as keyof typeof distribution]}
                            </span>
                        </div>
                    ))}
                </div>
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
                            Note minimale
                        </label>
                        <select
                            value={filters.minRating}
                            onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Aucune</option>
                            <option value="1">1 étoile</option>
                            <option value="2">2 étoiles</option>
                            <option value="3">3 étoiles</option>
                            <option value="4">4 étoiles</option>
                            <option value="5">5 étoiles</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note maximale
                        </label>
                        <select
                            value={filters.maxRating}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxRating: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Aucune</option>
                            <option value="1">1 étoile</option>
                            <option value="2">2 étoiles</option>
                            <option value="3">3 étoiles</option>
                            <option value="4">4 étoiles</option>
                            <option value="5">5 étoiles</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des évaluations */}
            <div className="bg-white rounded-lg shadow border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Évaluations ({filteredEvaluations.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredEvaluations.map((evaluation) => (
                        <div key={evaluation.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-yellow-400 text-lg">
                                                {renderStars(evaluation.overallRating)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 ml-2">
                                                {evaluation.overallRating}/5
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {evaluation.isAnonymous ? 'Anonyme' : `${evaluation.enrollment.firstName} ${evaluation.enrollment.lastName}`}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(evaluation.submittedAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-3">
                                        Formation: <span className="font-medium">{evaluation.formation.title}</span>
                                        {evaluation.session && (
                                            <> • Session: {new Date(evaluation.session.startDate).toLocaleDateString('fr-FR')} à {evaluation.session.location}</>
                                        )}
                                    </div>

                                    {evaluation.overallComment && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">Commentaire général:</h4>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{evaluation.overallComment}</p>
                                        </div>
                                    )}

                                    {/* Détails des notes */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                        {evaluation.contentRating && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Contenu</div>
                                                <div className="text-yellow-400">{renderStars(evaluation.contentRating)}</div>
                                            </div>
                                        )}
                                        {evaluation.instructorRating && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Formateur</div>
                                                <div className="text-yellow-400">{renderStars(evaluation.instructorRating)}</div>
                                            </div>
                                        )}
                                        {evaluation.materialRating && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Supports</div>
                                                <div className="text-yellow-400">{renderStars(evaluation.materialRating)}</div>
                                            </div>
                                        )}
                                        {evaluation.organizationRating && (
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500">Organisation</div>
                                                <div className="text-yellow-400">{renderStars(evaluation.organizationRating)}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Points forts et améliorations */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {evaluation.strengths && (
                                            <div>
                                                <h4 className="text-sm font-medium text-green-700 mb-1">Points forts:</h4>
                                                <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">{evaluation.strengths}</p>
                                            </div>
                                        )}
                                        {evaluation.improvements && (
                                            <div>
                                                <h4 className="text-sm font-medium text-orange-700 mb-1">À améliorer:</h4>
                                                <p className="text-sm text-gray-700 bg-orange-50 p-2 rounded">{evaluation.improvements}</p>
                                            </div>
                                        )}
                                    </div>

                                    {evaluation.recommendations && (
                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium text-blue-700 mb-1">Recommandations:</h4>
                                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{evaluation.recommendations}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}