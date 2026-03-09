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

type NewsFormState = {
  title: string
  content: string
  category: string
  tagsInput: string
  publicationDate: string
  imageDataUrl: string | null
  published: boolean
}

const DEFAULT_CATEGORY = 'General'
const PAGE_SIZE = 8
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function todayAsInputDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyFormState(): NewsFormState {
  return {
    title: '',
    content: '',
    category: DEFAULT_CATEGORY,
    tagsInput: '',
    publicationDate: todayAsInputDate(),
    imageDataUrl: null,
    published: true,
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

export default function AdminActualitesPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState<NewsFormState>(emptyFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    date: '',
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
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

  async function loadNews(targetPage = page) {
    const params = new URLSearchParams()
    params.set('page', String(targetPage))
    params.set('pageSize', String(PAGE_SIZE))

    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filters.category !== 'all') params.set('category', filters.category)
    if (filters.date) params.set('date', filters.date)

    const response = await fetch(`/api/admin/system/news?${params.toString()}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload?.error || 'Impossible de charger les actualites.')
    }

    const payload = (await response.json()) as NewsResponse
    setNews(payload.news || [])
    setCategories(payload.categories || [])
    setPagination(payload.pagination || { page: 1, pageSize: PAGE_SIZE, total: 0, pageCount: 1 })
    return payload
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    loadNews()
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inattendue.'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, filters.category, filters.date])

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
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content,
      category: item.category || DEFAULT_CATEGORY,
      tagsInput: item.tags.join(', '),
      publicationDate: item.publicationDate.slice(0, 10),
      imageDataUrl: item.imageDataUrl || null,
      published: item.published,
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

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || DEFAULT_CATEGORY,
      tags: parseTagInput(form.tagsInput),
      publicationDate: form.publicationDate || todayAsInputDate(),
      imageDataUrl: form.imageDataUrl,
      published: form.published,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/system/news/${editingId}` : '/api/admin/system/news'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.error || 'Enregistrement impossible.')
      }

      resetForm()
      const refreshed = await loadNews(page)
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
    const response = await fetch(`/api/admin/system/news/${item.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      setError(body?.error || 'Suppression impossible.')
      return
    }

    const nextPage = news.length === 1 && page > 1 ? page - 1 : page
    if (nextPage !== page) {
      setPage(nextPage)
    } else {
      await loadNews(nextPage)
    }
  }

  return (
    <AdminShell title="Gestion des actualites">
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? 'Modifier une actualite' : 'Creer une actualite'}
              </h2>
              <p className="text-sm text-slate-500">Titre, image, contenu riche, categorie, tags et date de publication.</p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Annuler edition
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
                  Titre
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
                  <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
                    Categorie
                  </label>
                  <input
                    id="category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    placeholder="Ex: Formations"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
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
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tagsInput" className="mb-1 block text-sm font-medium text-slate-700">
                  Tags (separes par virgule)
                </label>
                <input
                  id="tagsInput"
                  value={form.tagsInput}
                  onChange={(event) => setForm((prev) => ({ ...prev, tagsInput: event.target.value }))}
                  placeholder="emploi, certifiante, innovation"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
                />
              </div>

              <div>
                <label htmlFor="image" className="mb-1 block text-sm font-medium text-slate-700">
                  Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, GIF. Max 2 MB. Stockee en base de donnees.</p>
                {form.imageDataUrl ? (
                  <div className="mt-3">
                    <img
                      src={form.imageDataUrl}
                      alt="Apercu actualite"
                      className="h-40 w-full rounded-lg border border-slate-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageDataUrl: null }))}
                      className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Retirer l image
                    </button>
                  </div>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
                />
                Publier cette actualite
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contenu / description (WYSIWYG)</label>
              <RichTextEditor
                value={form.content}
                onChange={(next) => setForm((prev) => ({ ...prev, content: next }))}
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Creer l actualite'}
            </button>
          </div>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
                Recherche (titre/contenu)
              </label>
              <input
                id="search"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Rechercher une actualite..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              />
            </div>
            <div className="min-w-[180px]">
              <label htmlFor="categoryFilter" className="mb-1 block text-sm font-medium text-slate-700">
                Categorie
              </label>
              <select
                id="categoryFilter"
                value={filters.category}
                onChange={(event) => {
                  setPage(1)
                  setFilters((prev) => ({ ...prev, category: event.target.value }))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              >
                <option value="all">Toutes</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px]">
              <label htmlFor="dateFilter" className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="dateFilter"
                type="date"
                value={filters.date}
                onChange={(event) => {
                  setPage(1)
                  setFilters((prev) => ({ ...prev, date: event.target.value }))
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring"
              />
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? 'Chargement...' : `${pagination.total} actualite(s)`}
            </p>
            {(filters.search || filters.category !== 'all' || filters.date) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ search: '', category: 'all', date: '' })
                  setDebouncedSearch('')
                  setPage(1)
                }}
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                Reinitialiser les filtres
              </button>
            )}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Image</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Titre</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Auteur</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Categorie</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      {item.imageDataUrl ? (
                        <img
                          src={item.imageDataUrl}
                          alt={item.title}
                          className="h-14 w-20 rounded-md border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Aucune</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{plainTextExcerpt(item.content)}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{formatDate(item.publicationDate)}</td>
                    <td className="px-3 py-3 text-slate-700">{item.author || 'Admin'}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {item.category || DEFAULT_CATEGORY}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNews(item)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && news.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-7 text-center text-sm text-slate-500">
                      Aucune actualite pour ces filtres.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {news.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex gap-3">
                  {item.imageDataUrl ? (
                    <img
                      src={item.imageDataUrl}
                      alt={item.title}
                      className="h-16 w-20 rounded-md border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="grid h-16 w-20 place-items-center rounded-md border border-dashed border-slate-300 text-xs text-slate-400">
                      no image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(item.publicationDate)}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.author || 'Admin'} | {item.category || DEFAULT_CATEGORY}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600">{plainTextExcerpt(item.content, 140)}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNews(item)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
            {!loading && news.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
                Aucune actualite pour ces filtres.
              </p>
            ) : null}
          </div>

          {pagination.pageCount > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Precedent
              </button>

              <div className="flex flex-wrap gap-1">
                {pageNumbers.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      value === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pageCount))}
                disabled={page >= pagination.pageCount}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </AdminShell>
  )
}

