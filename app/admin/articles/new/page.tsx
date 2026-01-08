'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewArticle(){
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [excerpt,setExcerpt]=useState('')
  const [content,setContent]=useState('')
  const [published,setPublished]=useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    try {
      const response = await fetch('/api/articles', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ title, slug, excerpt, content, published })
      })
      if (!response.ok) throw new Error('Erreur lors de la création')
      router.push('/admin/articles')
    } catch (error) {
      alert('Erreur lors de la création de l\'article')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">Titre</label>
        <input 
          id="title"
          type="text"
          required
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          className="w-full border p-2 rounded" 
        />
      </div>
      <div className="mt-2">
        <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
        <input 
          id="slug"
          type="text"
          required
          value={slug} 
          onChange={e=>setSlug(e.target.value)} 
          className="w-full border p-2 rounded" 
        />
      </div>
      <div className="mt-2">
        <label htmlFor="excerpt" className="block text-sm font-medium mb-1">Extrait</label>
        <input 
          id="excerpt"
          type="text"
          value={excerpt} 
          onChange={e=>setExcerpt(e.target.value)} 
          className="w-full border p-2 rounded" 
        />
      </div>
      <div className="mt-2">
        <label htmlFor="content" className="block text-sm font-medium mb-1">Contenu</label>
        <textarea 
          id="content"
          required
          value={content} 
          onChange={e=>setContent(e.target.value)} 
          className="w-full border p-2 rounded h-40" 
        />
      </div>
      <div className="mt-2">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={published} 
            onChange={e=>setPublished(e.target.checked)} 
          /> 
          Publié
        </label>
      </div>
      <div className="mt-4">
        <button className="btn-primary">Créer</button>
      </div>
    </form>
  )
}
