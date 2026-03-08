'use client'

import { FormEvent, useEffect, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'

type NewsItem = {
  id: string
  title: string
  content: string
  published: boolean
  createdAt: string
}

const initialForm = {
  title: '',
  content: '',
  published: false,
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadNews() {
    const response = await fetch('/api/admin/system/news')
    if (!response.ok) return
    const data = await response.json()
    setNews(data.news || [])
  }

  useEffect(() => {
    loadNews()
  }, [])

  function startEdit(item: NewsItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content,
      published: item.published,
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(initialForm)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)

    const method = editingId ? 'PUT' : 'POST'
    const url = editingId ? `/api/admin/system/news/${editingId}` : '/api/admin/system/news'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    resetForm()
    setLoading(false)
    await loadNews()
  }

  async function removeNews(id: string) {
    const confirmed = window.confirm('Delete this news item?')
    if (!confirmed) return

    await fetch(`/api/admin/system/news/${id}`, { method: 'DELETE' })
    await loadNews()
  }

  return (
    <AdminShell title="News">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={onSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{editingId ? 'Edit article' : 'Create article'}</h2>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <textarea
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Content"
              className="min-h-40 w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm((prev) => ({ ...prev, published: event.target.checked }))}
              />
              Publish immediately
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-700 line-clamp-4">{item.content}</p>
              <p className="mb-3 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)} className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                  Edit
                </button>
                <button onClick={() => removeNews(item.id)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {news.length === 0 ? <p className="text-sm text-gray-500">No news articles yet.</p> : null}
        </div>
      </div>
    </AdminShell>
  )
}
