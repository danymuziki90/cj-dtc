'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type NewsItem = {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
  author: string
  category: string
  tags: string[]
  publicationDate: string
  imageDataUrl?: string | null
  metadata?: {
    contractType?: string
    location?: string
    deadline?: string
    contactEmail?: string
    domain?: string
  }
}

type NewsResponse = {
  news: NewsItem[]
  categories: string[]
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
}

type EmploiFormState = {
  title: string
  content: string
  tagsInput: string
  publicationDate: string
  imageDataUrl: string | null
  published: boolean
  contractType: string
  location: string
  deadline: string
  contactEmail: string
  domain: string
}

const PAGE_SIZE = 8
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function todayAsInputDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyFormState(): EmploiFormState {
  return {
    title: '',
    content: '',
    tagsInput: '',
    publicationDate: todayAsInputDate(),
    imageDataUrl: null,
    published: true,
    contractType: '',
    location: '',
    deadline: '',
    contactEmail: '',
    domain: '',
  }
}

function parseTagInput(value: string) {
  const seen = new Set<string>()
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function plainTextExcerpt(html: string, maxLength = 120) {
  const cleaned = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength)}...`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current) return
    if (editorRef.current.innerHTML === value) return
    editorRef.current.innerHTML = value || ''
  }, [value])

  function runCommand(command: string) {
    editorRef.current?.focus()
    document.execCommand(command, false)
    onChange(editorRef.current?.innerHTML || '')
  }

  function createLink() {
    const url = window.prompt('URL du lien (https://...)')
    if (!url) return
    editorRef.current?.focus()
    document.execCommand('createLink', false, url.trim())
    onChange(editorRef.current?.innerHTML || '')
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2">
        <button
          type="button"
          onClick={() => runCommand('bold')}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Gras
        </button>
        <button
          type="button"
          onClick={() => runCommand('italic')}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Italique
        </button>
        <button
          type="button"
          onClick={() => runCommand('underline')}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Souligne
        </button>
        <button
          type="button"
          onClick={() => runCommand('insertUnorderedList')}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Liste
        </button>
        <button
          type="button"
          onClick={createLink}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Lien
        </button>
        <button
          type="button"
          onClick={() => runCommand('removeFormat')}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Nettoyer
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-44 w-full p-3 text-sm text-slate-900 outline-none"
      />
    </div>
  )
}

export default function AdminEmploisPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState<EmploiFormState>(emptyFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    pageCount: 1,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
      setPage(1)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [filters.search])

  async function loadEmplois(targetPage = page) {
    const params = new URLSearchParams()
    params.set('page', String(targetPage))
    params.set('pageSize', String(PAGE_SIZE))

    if (debouncedSearch) params.set('search', debouncedSearch)
    
    // We fetch from the emplois route which forces category='Emplois'
    const response = await fetch(`/api/admin/system/emplois?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload?.error || 'Impossible de charger les offres d emploi.')
    }

    const payload = (await response.json()) as NewsResponse
    setNews(payload.news || [])
    setPagination(payload.pagination || { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 1 })
    return payload
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    loadEmplois()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inattendue.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch])

  const pageNumbers = useMemo(() => {
    if (pagination.pageCount <= 1) return []
    const start = Math.max(1, pagination.page - 2)
    const end = Math.min(pagination.pageCount, start + 4)
    const numbers: number[] = []

    for (let i = start; i <= end; i += 1) numbers.push(i)
    return numbers
  }, [pagination.page, pagination.pageCount])

  function resetForm() {
    setEditingId(null)
    setForm(emptyFormState())
    setError(null)
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id)
    setError(null)
    setSuccessMessage(null)
    setForm({
      title: item.title,
      content: item.content,
      tagsInput: item.tags.join(', '),
      publicationDate: item.publicationDate.slice(0, 10),
      imageDataUrl: item.imageDataUrl || null,
      published: item.published,
      contractType: item.metadata?.contractType || '',
      location: item.metadata?.location || '',
      deadline: item.metadata?.deadline || '',
      contactEmail: item.metadata?.contactEmail || '',
      domain: item.metadata?.domain || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selectionnez uniquement un fichier image.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image trop volumineuse. Taille max: 2 MB.')
      return
    }

    const encoded = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Impossible de lire l image.'))
      reader.readAsDataURL(file)
    })

    setError(null)
    setForm((prev) => ({ ...prev, imageDataUrl: encoded }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: 'Emplois', // forced
      tags: parseTagInput(form.tagsInput),
      publicationDate: form.publicationDate || todayAsInputDate(),
      imageDataUrl: form.imageDataUrl,
      published: form.published,
      metadata: {
        contractType: form.contractType,
        location: form.location,
        deadline: form.deadline,
        contactEmail: form.contactEmail,
        domain: form.domain,
      }
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/system/emplois/${editingId}` : '/api/admin/system/emplois'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Enregistrement impossible.')
      }

      const isEditing = Boolean(editingId)
      resetForm()
      setSuccessMessage(isEditing ? 'Offre mise à jour avec succès !' : 'Offre enregistrée avec succès !')
      setTimeout(() => setSuccessMessage(null), 5000)

      const refreshed = await loadEmplois(page)
      if (refreshed.pagination.pageCount > 0 && page > refreshed.pagination.pageCount) {
        setPage(refreshed.pagination.pageCount)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.')
    } finally {
      setSaving(false)
    }
  }

  async function removeNews(item: NewsItem) {
    const confirmed = window.confirm(`Supprimer "${item.title}" ? Cette action est irreversible.`)
    if (!confirmed) return

    setError(null)
    const response = await fetch(`/api/admin/system/emplois/${item.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      setError(body?.error || 'Suppression impossible.')
      return
    }

    const nextPage = news.length === 1 && page > 1 ? page - 1 : page
    if (nextPage !== page) {
      setPage(nextPage)
    } else {
      await loadEmplois(nextPage)
    }
  }

  return (
    <AdminShell title="Recrutement / Emplois">
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Modifier une offre d emploi' : 'Publier une offre d emploi'}
              </h2>
              <p className="text-sm text-slate-500">Titre, lieu, contrat, description et conditions.</p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler l edition
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
                  Titre de l'offre
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="domain" className="mb-1 block text-sm font-medium text-slate-700">
                    Domaine / Département
                  </label>
                  <input
                    id="domain"
                    value={form.domain}
                    onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                    placeholder="Ex: Marketing, IT, RH..."
                  />
                </div>
                <div>
                  <label htmlFor="contractType" className="mb-1 block text-sm font-medium text-slate-700">
                    Type de contrat
                  </label>
                  <select
                    id="contractType"
                    value={form.contractType}
                    onChange={(event) => setForm((prev) => ({ ...prev, contractType: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  >
                    <option value="">Sélectionner</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Bénévole">Bénévole</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="mb-1 block text-sm font-medium text-slate-700">
                    Lieu
                  </label>
                  <input
                    id="location"
                    value={form.location}
                    onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                    placeholder="Ex: Paris, Distanciel..."
                  />
                </div>
                <div>
                  <label htmlFor="deadline" className="mb-1 block text-sm font-medium text-slate-700">
                    Date limite de candidature
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-slate-700">
                    Email de candidature
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                    placeholder="recrutement@exemple.com"
                  />
                </div>
                <div>
                  <label htmlFor="publicationDate" className="mb-1 block text-sm font-medium text-slate-700">
                    Date de publication
                  </label>
                  <input
                    id="publicationDate"
                    type="date"
                    value={form.publicationDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, publicationDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Image de couverture</label>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="imageInput"
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Choisir un fichier
                  </label>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {form.imageDataUrl ? (
                    <div className="flex items-center gap-2">
                      <img src={form.imageDataUrl} alt="Preview" className="h-10 w-10 rounded-md object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, imageDataUrl: null }))}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Aucune image sélectionnée</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex h-full flex-col">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description de l'offre (Missions, Profil, Conditions...)
                </label>
                <div className="flex-1">
                  <RichTextEditor
                    value={form.content}
                    onChange={(next) => setForm((prev) => ({ ...prev, content: next }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Publier l'offre en ligne</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Enregistrer'}
            </button>
          </div>

          {error ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div> : null}
          {successMessage ? (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">{successMessage}</div>
          ) : null}
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="search"
                placeholder="Rechercher une offre..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none ring-blue-500 focus:ring"
              />
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Offre</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Contrat</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                    </td>
                  </tr>
                ) : news.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Aucune offre trouvée.
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imageDataUrl ? (
                            <img src={item.imageDataUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 line-clamp-1">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.metadata?.domain || 'Général'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.published ? (
                          <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">Publié</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Brouillon</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.metadata?.contractType || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(item.publicationDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Modifier"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeNews(item)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pageCount > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                {pagination.total} offre{pagination.total > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-[32px] rounded-lg px-2 text-sm font-medium transition ${
                      p === page ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminShell>
  )
}
