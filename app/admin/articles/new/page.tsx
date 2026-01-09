'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function slugify(str: string) {
  return str
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

export default function NewArticle() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // auto-generate slug when title changes
  useEffect(() => {
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(title))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('slug', slug)
      formData.append('excerpt', excerpt)
      formData.append('content', content)
      formData.append('published', published ? 'true' : 'false')
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data?.error || 'Erreur lors de la création')
        setSubmitting(false)
        return
      }
      router.push('/admin/articles')
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded">{error}</div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Titre</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={e => setSlug(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <p className="text-xs text-gray-500 mt-1">Généré automatiquement depuis le titre.</p>
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-1">Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-2 rounded"
        />
        {imagePreview && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
            <img src={imagePreview} alt="Preview" className="max-w-xs h-auto rounded border" />
          </div>
        )}
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1">Extrait</label>
        <input
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Résumé court de l'article"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-1">Contenu</label>
        <textarea
          id="content"
          required
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full border p-2 rounded h-40"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
          />
          <span className="text-sm font-medium">Publier cet article</span>
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Création...' : 'Créer'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </form>
  )
}
