'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, AlertCircle, RotateCw, Eye } from 'lucide-react'
import FormationForm from '@/components/admin/FormationForm'

export default function EditFormationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [formation, setFormation] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [successMsg, setSuccessMsg]   = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/formations/${id}`)
      .then(r => r.json())
      .then(data => { setFormation(data); setIsLoading(false) })
      .catch(() => { setError('Impossible de charger la formation'); setIsLoading(false) })
  }, [id])

  async function handleSubmit(data: Record<string, any>) {
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/formations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la mise à jour')
      setSuccessMsg('Formation mise à jour avec succès')
      setFormation(json)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RotateCw className="w-5 h-5 animate-spin" />
          <span>Chargement de la formation…</span>
        </div>
      </div>
    )
  }

  if (!formation || (formation as any).error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-600">Formation introuvable.</p>
        <Link href="/admin/formations" className="text-blue-600 hover:underline text-sm">
          Retour aux formations
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/formations"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm transition-colors flex-shrink-0">
              <ChevronLeft className="w-4 h-4" />
              Formations
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {formation.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/fr/formations/${formation.slug}`} target="_blank"
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Eye className="w-4 h-4" />
              Voir
            </Link>
            <Link href="/admin/formations"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Annuler
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <span className="w-5 h-5 flex-shrink-0">✓</span>
            <p className="text-sm">{successMsg}</p>
          </div>
        )}
        <FormationForm
          initialData={formation}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  )
}
