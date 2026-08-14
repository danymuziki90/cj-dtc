'use client'

import { FormEvent, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin-portal/AdminShell'
import { Upload, X, FileText, Loader2 } from 'lucide-react'

type Formation = { id: number; title: string }
type Session = { id: number; title: string; formationId: number }

export interface UploadedFileData {
  name: string
  originalName: string
  size: number
  mimeType: string
  url: string
  key: string
}

export interface UploadFileStateItem {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  errorMessage?: string
  data?: UploadedFileData
}

export default function AdminNouveauTravailPage() {
  const router = useRouter()
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [fileItems, setFileItems] = useState<UploadFileStateItem[]>([])
  const xhrMapRef = useRef<Map<string, XMLHttpRequest>>(new Map())

  const [form, setForm] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    type: 'tp',
    formationId: '',
    sessionId: '',
    deadline: new Date().toISOString().slice(0, 10),
    instructions: '',
    instructionsEn: '',
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
    
    return () => {
      xhrMapRef.current.forEach((xhr) => {
        try { xhr.abort() } catch {}
      })
    }
  }, [])

  const filteredSessions = form.formationId 
    ? sessions.filter(s => s.formationId === parseInt(form.formationId))
    : sessions

  const uploadFileToServer = (item: UploadFileStateItem) => {
    if (xhrMapRef.current.has(item.id)) {
      try { xhrMapRef.current.get(item.id)?.abort() } catch {}
      xhrMapRef.current.delete(item.id)
    }

    setFileItems((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 0, errorMessage: undefined } : f))
    )

    const xhr = new XMLHttpRequest()
    xhrMapRef.current.set(item.id, xhr)
    xhr.timeout = 60000

    const formData = new FormData()
    formData.append("file", item.file)
    formData.append("maxFileSize", form.maxFileSize || "50")

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f)))
      }
    })

    xhr.addEventListener("load", () => {
      xhrMapRef.current.delete(item.id)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText)
          if (res.success && res.file && res.file.url) {
            setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "completed", progress: 100, data: res.file } : f)))
          } else {
            setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: res.error || "Erreur serveur" } : f)))
          }
        } catch {
          setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: "Format de réponse invalide" } : f)))
        }
      } else {
        setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: `Erreur ${xhr.status}` } : f)))
      }
    })

    xhr.addEventListener("error", () => {
      xhrMapRef.current.delete(item.id)
      setFileItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", errorMessage: "Erreur réseau" } : f)))
    })

    xhr.open("POST", "/api/admin/upload")
    xhr.send(formData)
  }

  const handleFileSelection = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return

    const newFiles = Array.from(filesList)
    const itemsToAdd: UploadFileStateItem[] = newFiles.map((file) => {
      const itemId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      return { id: itemId, file, progress: 0, status: "pending" }
    })

    setFileItems((prev) => [...prev, ...itemsToAdd])
    itemsToAdd.forEach((item) => uploadFileToServer(item))
  }

  const removeFile = (id: string) => {
    if (xhrMapRef.current.has(id)) {
      try { xhrMapRef.current.get(id)?.abort() } catch {}
      xhrMapRef.current.delete(id)
    }
    setFileItems(prev => prev.filter(f => f.id !== id))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    // Check if any files are still uploading
    if (fileItems.some(f => f.status === 'uploading' || f.status === 'pending')) {
      setError("Veuillez patienter la fin du téléversement des fichiers.")
      return
    }

    setSaving(true)
    setError(null)
    
    const completedFiles = fileItems.filter((f) => f.status === "completed" && f.data).map((f) => f.data!)
    
    try {
      const payload = {
        ...form,
        files: completedFiles
      }

      const res = await fetch('/api/admin/travaux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    <AdminShell title="Travaux">
      <div className="max-w-3xl mx-auto pb-12">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre (FR) *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3"
                  placeholder="Ex: TP1 - Introduction à la comptabilité"
                />
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre (EN)</label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={e => setForm({ ...form, titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Ex: Lab 1 - Intro to Accounting"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description courte (FR) *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Description rapide du travail à effectuer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description courte (EN)</label>
                <textarea
                  rows={3}
                  value={form.descriptionEn}
                  onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Quick description"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consignes détaillées (FR)</label>
                <textarea
                  rows={5}
                  value={form.instructions}
                  onChange={e => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Détaillez les instructions, les objectifs, les critères d'évaluation..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Consignes détaillées (EN)</label>
                <textarea
                  rows={5}
                  value={form.instructionsEn}
                  onChange={e => setForm({ ...form, instructionsEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Instructions in English..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Ressources & Pièces jointes</h2>
            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-[24px] p-8 bg-slate-50 hover:bg-blue-50/50 hover:border-[#2A52BE] transition-all cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  handleFileSelection(e.target.files)
                  e.target.value = ""
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 group-hover:bg-[#2A52BE] group-hover:text-white transition-colors mb-3 shadow-sm">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 text-center">
                Glissez-déposez ou cliquez pour ajouter des consignes
              </p>
              <p className="text-xs text-slate-400 mt-2 text-center">
                Sujets, maquettes, datasets (PDF, ZIP, DOCX...)
              </p>
            </div>

            {fileItems.length > 0 && (
              <div className="mt-4 space-y-2">
                {fileItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--cj-blue)]">
                        {item.status === 'uploading' ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-medium text-slate-700">{item.file.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          {item.status === 'error' && (
                            <span className="text-xs text-red-500 font-medium">Erreur: {item.errorMessage}</span>
                          )}
                          {item.status === 'completed' && (
                            <span className="text-xs text-emerald-600 font-medium">Prêt</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {item.status === 'uploading' && (
                      <div className="w-24 shrink-0 px-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full bg-[var(--cj-blue)] transition-all duration-300" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={saving || fileItems.some(f => f.status === 'uploading' || f.status === 'pending')}
              className="px-5 py-2 text-white bg-[#2A52BE] rounded-lg hover:bg-[#20409A] transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Création en cours...
                </>
              ) : 'Créer le travail'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}

