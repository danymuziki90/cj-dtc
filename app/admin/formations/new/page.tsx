'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewFormation(){
  const [title,setTitle]=useState('')
  const [slug,setSlug]=useState('')
  const [description,setDescription]=useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    try {
      const response = await fetch('/api/formations', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ title, slug, description })
      })
      if (!response.ok) throw new Error('Erreur lors de la création')
      router.push('/admin/formations')
    } catch (error) {
      alert('Erreur lors de la création de la formation')
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl">
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
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          id="description"
          required
          value={description} 
          onChange={e=>setDescription(e.target.value)} 
          className="w-full border p-2 rounded" 
        />
      </div>
      <div className="mt-4">
        <button className="btn-primary">Créer</button>
      </div>
    </form>
  )
}
