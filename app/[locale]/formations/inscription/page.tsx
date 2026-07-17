'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPinIcon, Clock, Users, DollarSign, CheckCircle, ArrowLeft, AlertCircle, FileUp } from 'lucide-react'
import { FormattedDate } from '@/components/FormattedDate'

interface TrainingSession {
    id: number
    formationId: number
    formation: {
        id: number
        title: string
        slug: string
        description: string
    }
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    location: string
    format: string
    maxParticipants: number
    currentParticipants: number
    price: number
    status: string
    description?: string
    prerequisites?: string
    objectives?: string
    imageUrl?: string
    adminMeta?: {
        imageUrl?: string | null
    }
}

// ── Type questions personnalisées ───────────────────────────────────────────
interface FormQuestion {
    id: number
    label: string
    type: string
    helpText: string | null
    required: boolean
    order: number
    options: string[]
    fileTypes: string[]
}

function InscriptionContent() {
    const router = useRouter()
    const params = useParams()
    const locale = params?.locale as string || 'fr'
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session')

    const [session, setSession] = useState<TrainingSession | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [onWaitlist, setOnWaitlist] = useState(false)

    // Questions personnalisées
    const [customQuestions, setCustomQuestions] = useState<FormQuestion[]>([])
    const [customAnswers, setCustomAnswers] = useState<Record<number, string | string[] | { fileUrl: string, fileName: string }>>({})
    const [customErrors, setCustomErrors] = useState<Record<number, string>>({})
    const [uploadingFiles, setUploadingFiles] = useState<Record<number, boolean>>({})

    const handleFileUpload = async (questionId: number, file: File, allowedTypes: string[]) => {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
        if (allowedTypes.length > 0 && !allowedTypes.includes(fileExt)) {
            alert(`Format de fichier non autorisé. Autorisé(s) : ${allowedTypes.map(t => `.${t}`).join(', ')}`)
            return
        }

        setUploadingFiles(prev => ({ ...prev, [questionId]: true }))
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'submissions')

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || "Erreur de téléversement")
            }

            const data = await res.json()
            setCustomAnswers(prev => ({
                ...prev,
                [questionId]: {
                    fileUrl: data.url,
                    fileName: file.name
                }
            }))
            // Clear any error
            setCustomErrors(prev => {
                const next = { ...prev }
                delete next[questionId]
                return next
            })
        } catch (error: any) {
            console.error('File upload error:', error)
            alert(`Échec du téléversement : ${error.message || error}`)
        } finally {
            setUploadingFiles(prev => ({ ...prev, [questionId]: false }))
        }
    }

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        motivationLetter: '',
        acceptTerms: false
    })

    useEffect(() => {
        if (sessionId) {
            loadSession()
        } else {
            setLoading(false)
        }
    }, [sessionId])

    const loadSession = async () => {
        try {
            const [sessionRes, questionsRes] = await Promise.all([
                fetch(`/api/sessions/${sessionId}`),
                fetch(`/api/sessions/${sessionId}/form-questions`),
            ])
            if (sessionRes.ok) {
                const data = await sessionRes.json()
                setSession(data)
            } else {
                alert('La session de formation demandée est introuvable.')
                router.push('/formations')
            }
            if (questionsRes.ok) {
                const qData = await questionsRes.json()
                setCustomQuestions(Array.isArray(qData) ? qData : [])
            }
        } catch (error) {
            console.error('Erreur chargement session:', error)
            alert('Erreur lors du chargement de la session de formation.')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // Validation côté client des champs personnalisés
    const validateCustom = (): boolean => {
        const errors: Record<number, string> = {}
        for (const q of customQuestions) {
            if (!q.required) continue
            const val = customAnswers[q.id]
            const isEmpty =
                val === undefined ||
                val === null ||
                (typeof val === 'string' && !val.trim()) ||
                (Array.isArray(val) && val.length === 0) ||
                (q.type === 'file_upload' && !(val && typeof val === 'object' && !Array.isArray(val) && 'fileUrl' in val))
            if (isEmpty) {
                errors[q.id] = 'Veuillez remplir ce champ obligatoire.'
            }
        }
        setCustomErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.acceptTerms) {
            alert('Veuillez accepter les conditions générales')
            return
        }

        if (!validateCustom()) {
            // Scroll vers la première erreur
            const firstErrorEl = document.querySelector('[data-question-error]')
            firstErrorEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        if (!session) return

        setSubmitting(true)

        try {
            // 1. Créer l'enrollment
            const enrollmentData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                formationId: session.formationId,
                sessionId: session.id,
                motivationLetter: formData.motivationLetter,
                startDate: session.startDate
            }

            const response = await fetch('/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData)
            })

            if (!response.ok) {
                const error = await response.json()
                alert(error.error || "Erreur lors de l'inscription")
                return
            }

            const result = await response.json()

            // 2. Soumettre les réponses personnalisées si présent
            if (customQuestions.length > 0 && result.id) {
                const answers = customQuestions.map((q) => {
                    const val = customAnswers[q.id]
                    if (q.type === 'checkbox') {
                        return {
                            questionId: q.id,
                            jsonValue: Array.isArray(val) ? val : [],
                        }
                    }
                    if (q.type === 'file_upload') {
                        const fileObj = typeof val === 'object' && val !== null ? (val as any) : {}
                        return {
                            questionId: q.id,
                            fileUrl: fileObj.fileUrl || null,
                            fileName: fileObj.fileName || null,
                        }
                    }
                    return {
                        questionId: q.id,
                        textValue: typeof val === 'string' ? val : '',
                    }
                })

                await fetch(`/api/sessions/${session.id}/form-answers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enrollmentId: result.id, answers }),
                })
                // On ignore les erreurs de réponses (non bloquant)
            }

            setOnWaitlist(result.onWaitlist || false)
            setSuccess(true)
            if (!result.onWaitlist && result.studentAccount) {
                setTimeout(() => {
                    router.push(`/${locale}/espace-etudiants`)
                }, 1500)
            }
        } catch (error) {
            console.error('Erreur:', error)
            alert("Erreur lors de l'inscription")
        } finally {
            setSubmitting(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cjblue"></div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        {onWaitlist ? (
                            <>
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    Inscription en liste d'attente
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    La session <strong>{session?.formation.title}</strong> est complète. Votre inscription a été enregistrée dans la liste d'attente.
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-red-900 mb-2">Vous serez notifié si :</h3>
                                        <ul className="text-red-800 text-sm space-y-1">
                                            <li>• Une place se libère dans la session actuelle</li>
                                            <li>• Une nouvelle session est ouverte</li>
                                            <li>• Une date alternative devient disponible</li>
                                        </ul>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    Inscription réussie !
                                </h1>
                                <p className="text-gray-600 mb-6">
                                    Votre inscription à la formation <strong>{session?.formation.title}</strong> a été enregistrée.
                                </p>
                                <div className="space-y-4 mb-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-950 mb-2 animate-pulse">Connexion automatique en cours...</h3>
                                        <p className="text-blue-800 text-sm">
                                            Vous allez être redirigé vers votre espace étudiant dans quelques instants.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/formations"
                                className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Voir d'autres formations
                            </Link>
                            <Link
                                href="/"
                                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Session non trouvée
                    </h1>
                    <p className="text-gray-600 mb-6">
                        La session que vous recherchez n'existe pas ou n'est plus disponible.
                    </p>
                    <Link
                        href="/formations"
                        className="bg-cjblue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voir les formations disponibles
                    </Link>
                </div>
            </div>
        )
    }

    const availableSpots = session.maxParticipants - (session.currentParticipants || 0)
    const isFull = availableSpots <= 0
    const sessionImageUrl = session.adminMeta?.imageUrl || session.imageUrl

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/formations/${session.formation.slug}`}
                        className="inline-flex items-center text-cjblue hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour à la formation
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Inscription à la formation
                    </h1>
                    <p className="text-gray-600">
                        Remplissez le formulaire ci-dessous pour vous inscrire à cette session
                    </p>
                </div>

                {/* Session Image */}
                {sessionImageUrl && (
                    <div className="mb-8">
                        <img
                            src={sessionImageUrl}
                            alt={`Session ${session.formation.title}`}
                            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Session Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                {session.formation.title}
                            </h2>

                            {/* Session Details */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Dates</p>
                                        <p className="text-sm text-gray-600">
                                            <FormattedDate date={session.startDate} /> - <FormattedDate date={session.endDate} />
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Horaires</p>
                                        <p className="text-sm text-gray-600">
                                            {session.startTime} - {session.endTime}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPinIcon className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Lieu</p>
                                        <p className="text-sm text-gray-600">{session.location}</p>
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                            {session.format}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Places disponibles</p>
                                        <p className={`text-sm ${isFull ? 'text-red-600' : 'text-blue-600'}`}>
                                            {availableSpots} places restantes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-5 h-5 text-cjblue mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Prix</p>
                                        <p className="text-sm text-gray-600">{formatPrice(session.price)}</p>
                                    </div>
                                </div>
                            </div>

                            {isFull && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm">
                                        Cette session est complète. Vous pouvez vous inscrire sur liste d'attente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Informations personnelles
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Téléphone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lettre de motivation
                                    </label>
                                    <textarea
                                        name="motivationLetter"
                                        value={formData.motivationLetter}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Expliquez brièvement vos motivations pour suivre cette formation..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent"
                                    ></textarea>
                                </div>

                                {/* ── Questions personnalisées ─────────────── */}
                                {customQuestions.length > 0 && (
                                    <div className="border-t border-gray-200 pt-6 space-y-5">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Questions complémentaires
                                        </h3>
                                        {customQuestions.map((q) => {
                                            const error = customErrors[q.id]
                                            const val = customAnswers[q.id]
                                            const setVal = (v: string | string[]) =>
                                                setCustomAnswers((prev) => ({ ...prev, [q.id]: v }))

                                            return (
                                                <div key={q.id} data-question-error={error ? true : undefined}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {q.label}
                                                        {q.required && <span className="text-red-500 ml-1">*</span>}
                                                    </label>
                                                    {q.helpText && (
                                                        <p className="text-xs text-gray-500 mb-1.5">{q.helpText}</p>
                                                    )}

                                                    {/* Rendu selon le type */}
                                                    {q.type === 'text_short' && (
                                                        <input type="text" value={typeof val === 'string' ? val : ''} onChange={(e) => setVal(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent text-sm ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                                    )}
                                                    {q.type === 'text_long' && (
                                                        <textarea value={typeof val === 'string' ? val : ''} onChange={(e) => setVal(e.target.value)} rows={3}
                                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent text-sm resize-none ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                                    )}
                                                    {q.type === 'number' && (
                                                        <input type="number" value={typeof val === 'string' ? val : ''} onChange={(e) => setVal(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent text-sm ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                                    )}
                                                    {q.type === 'date' && (
                                                        <input type="date" value={typeof val === 'string' ? val : ''} onChange={(e) => setVal(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent text-sm ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                                                    )}
                                                    {q.type === 'select' && (
                                                        <select value={typeof val === 'string' ? val : ''} onChange={(e) => setVal(e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-cjblue focus:border-transparent text-sm bg-white ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                                                            <option value="">-- Choisir --</option>
                                                            {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    )}
                                                    {q.type === 'radio' && (
                                                        <div className="space-y-2">
                                                            {q.options.map((opt) => (
                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                    <input type="radio" name={`q_${q.id}`} value={opt} checked={val === opt}
                                                                        onChange={() => setVal(opt)} className="accent-cjblue" />
                                                                    <span className="text-sm text-gray-700">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {q.type === 'checkbox' && (
                                                        <div className="space-y-2">
                                                            {q.options.map((opt) => {
                                                                const checked = Array.isArray(val) && val.includes(opt)
                                                                return (
                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                        <input type="checkbox" checked={checked}
                                                                            onChange={() => {
                                                                                const current = Array.isArray(val) ? val : []
                                                                                setVal(checked ? current.filter((v) => v !== opt) : [...current, opt])
                                                                            }} className="accent-cjblue" />
                                                                        <span className="text-sm text-gray-700">{opt}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                    {q.type === 'yes_no' && (
                                                        <div className="flex gap-4">
                                                            {['Oui', 'Non'].map((opt) => (
                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                    <input type="radio" name={`q_${q.id}`} value={opt} checked={val === opt}
                                                                        onChange={() => setVal(opt)} className="accent-cjblue" />
                                                                    <span className="text-sm text-gray-700">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {q.type === 'file_upload' && (() => {
                                                         const isUploading = uploadingFiles[q.id]
                                                         const fileObj = typeof val === 'object' && val !== null ? (val as any) : null
                                                         
                                                         return (
                                                             <div className={`border-2 border-dashed rounded-md p-5 text-center transition ${
                                                                 error ? 'border-red-400 bg-red-50/50' : 
                                                                 fileObj ? 'border-blue-300 bg-blue-50/20' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'
                                                             }`}>
                                                                 {isUploading ? (
                                                                     <div className="py-4">
                                                                         <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cjblue mb-2"></div>
                                                                         <p className="text-xs text-gray-500 font-semibold">Téléversement du document en cours...</p>
                                                                     </div>
                                                                 ) : fileObj ? (
                                                                     <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100 shadow-sm max-w-md mx-auto">
                                                                         <div className="flex items-center gap-2 overflow-hidden pr-2">
                                                                             <span className="text-xl shrink-0">📄</span>
                                                                             <span className="text-xs font-bold text-gray-700 truncate">{fileObj.fileName}</span>
                                                                         </div>
                                                                         <button
                                                                             type="button"
                                                                             onClick={() => setCustomAnswers(p => {
                                                                                 const next = { ...p }
                                                                                 delete next[q.id]
                                                                                 return next
                                                                             })}
                                                                             className="text-red-500 hover:text-red-700 text-xs font-black px-2 py-1 rounded hover:bg-red-50 transition"
                                                                         >
                                                                             Supprimer
                                                                         </button>
                                                                     </div>
                                                                 ) : (
                                                                     <label className="cursor-pointer block py-2">
                                                                         <FileUp className="h-7 w-7 text-gray-400 mx-auto mb-1.5" />
                                                                         <span className="text-xs font-bold text-cjblue hover:text-blue-700 block mb-1">
                                                                             Cliquez pour téléverser votre fichier
                                                                         </span>
                                                                         <p className="text-[10px] text-gray-400">
                                                                             Formats autorisés : {q.fileTypes && q.fileTypes.length > 0 ? q.fileTypes.map(t => `.${t}`).join(', ') : 'tous types'} (max 10 Mo)
                                                                         </p>
                                                                         <input
                                                                             type="file"
                                                                             className="hidden"
                                                                             accept={q.fileTypes && q.fileTypes.length > 0 ? q.fileTypes.map(t => `.${t}`).join(',') : '*/*'}
                                                                             onChange={(e) => {
                                                                                 const file = e.target.files?.[0]
                                                                                 if (file) handleFileUpload(q.id, file, q.fileTypes || [])
                                                                             }}
                                                                         />
                                                                     </label>
                                                                 )}
                                                             </div>
                                                         )
                                                     })()}

                                                    {error && (
                                                        <p className="mt-1 text-xs text-red-600 font-semibold">{error}</p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1"
                                    />
                                    <div className="text-sm">
                                        <label className="text-gray-700">
                                            J'accepte les{' '}
                                            <Link href="/conditions-generales" className="text-cjblue hover:underline">
                                                conditions générales
                                            </Link>{' '}
                                            et la{' '}
                                            <Link href="/politique-confidentialite" className="text-cjblue hover:underline">
                                                politique de confidentialité
                                            </Link>
                                            *
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t">
                                    <Link
                                        href={`/formations/${session.formation.slug}`}
                                        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting || isFull}
                                        className="px-6 py-3 bg-cjblue text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {submitting ? 'Inscription en cours...' : isFull ? "Liste d'attente" : "S'inscrire"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function InscriptionPage() {
    return (
        <Suspense fallback={null}>
            <InscriptionContent />
        </Suspense>
    )
}
