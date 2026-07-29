'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'

type Formation = { id: number; title: string }
type Session = { id: number; title: string; formationId: number }

export default function AdminNouveauTravailPage() {
  const router = useRouter()
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'tp',
    formationId: '',
    sessionId: '',
    deadline: new Date().toISOString().slice(0, 10),
    instructions: '',
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx,zip,rar,png,jpg,jpeg,excel,xls,xlsx',
    difficulty: 'intermediaire',
    objectives: '',
    published: true,
    allowResubmission: true,
    maxFiles: '5',
  })

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/admin/travaux')
        if (res.ok) {
          const data = await res.json()
          setFormations(data.formations || [])
          setSessions(data.sessions || [])
        }
      } catch (err) {
        console.error('Erreur de chargement des options', err)
      }
    }
    fetchOptions()
  }, [])

  const filteredSessions = form.formationId 
    ? sessions.filter(s => s.formationId === parseInt(form.formationId))
    : sessions

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      const res = await fetch('/api/admin/travaux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.push('/admin/travaux')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSaving(false)
    }
  }

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Nouveau Travail</h1>
          <p className="text-slate-500 text-sm mt-1">Créez un devoir ou un exercice pour vos étudiants.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Informations Générales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Ex: TP1 - Introduction à la comptabilité"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  required
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="tp">TP (Travail Pratique)</option>
                  <option value="projet">Projet</option>
                  <option value="examen">Examen</option>
                  <option value="devoir">Devoir maison</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description courte *</label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Description rapide du travail à effectuer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Consignes détaillées</label>
              <textarea
                rows={5}
                value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                placeholder="Détaillez les instructions, les objectifs, les critères d'évaluation..."
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Affectation & Planning</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Formation *</label>
                <select
                  required
                  value={form.formationId}
                  onChange={e => setForm({ ...form, formationId: e.target.value, sessionId: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Sélectionnez une formation</option>
                  {formations.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session (Optionnel)</label>
                <select
                  value={form.sessionId}
                  onChange={e => setForm({ ...form, sessionId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Toutes les sessions</option>
                  {filteredSessions.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date limite de dépôt *</label>
                <input
                  required
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulté</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="facile">Facile</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Paramètres de Dépôt</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Types de fichiers autorisés</label>
                <input
                  type="text"
                  value={form.allowedFileTypes}
                  onChange={e => setForm({ ...form, allowedFileTypes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="pdf,doc,zip..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Taille max par fichier (Mo)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.maxFileSize}
                  onChange={e => setForm({ ...form, maxFileSize: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 text-[#2A52BE] rounded border-slate-300 focus:ring-[#2A52BE]"
                  />
                  <span className="text-sm font-medium text-slate-700">Publier immédiatement</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={form.allowResubmission}
                    onChange={e => setForm({ ...form, allowResubmission: e.target.checked })}
                    className="w-4 h-4 text-[#2A52BE] rounded border-slate-300 focus:ring-[#2A52BE]"
                  />
                  <span className="text-sm font-medium text-slate-700">Autoriser le re-dépôt avant la date limite</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/admin/travaux')}
              className="px-5 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-white bg-[#2A52BE] rounded-lg hover:bg-[#20409A] transition-colors font-medium text-sm disabled:opacity-50"
            >
              {saving ? 'Création en cours...' : 'Créer le travail'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
