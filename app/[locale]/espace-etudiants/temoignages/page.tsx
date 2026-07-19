'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquareQuote, Send, Star } from 'lucide-react'
import { StudentEmptyState, StudentPageShell, StudentSectionCard, studentInputClassName, studentPrimaryButtonClassName } from '@/components/ui/student-space'

export default function TestimonialsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const [items, setItems] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ title: '', quote: '', formationId: '', sessionId: '', rating: 5, showName: false, showPhoto: false })

  async function load() {
    const [testimonials, dashboard] = await Promise.all([fetch('/api/student/testimonials'), fetch('/api/student/system/dashboard')])
    if (testimonials.ok) setItems(await testimonials.json())
    if (dashboard.ok) setSessions((await dashboard.json()).sessionsHistory || [])
  }
  useEffect(() => { load().catch(() => setMessage('Impossible de charger vos témoignages.')) }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage('')
    const response = await fetch('/api/student/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) return setMessage(payload.error || 'Envoi impossible.')
    setForm({ title: '', quote: '', formationId: '', sessionId: '', rating: 5, showName: false, showPhoto: false })
    setMessage('Merci pour votre témoignage. Il sera examiné par notre équipe avant sa publication sur le site.')
    load()
  }

  return <StudentPageShell locale={locale} eyebrow="Espace étudiant" title="Partager mon expérience" description="Votre retour aide les futurs participants à faire un choix éclairé." icon={MessageSquareQuote}>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <StudentSectionCard eyebrow="Nouveau témoignage" title="Racontez votre expérience" description="La publication est toujours soumise à validation par l'administration." icon={Send}>
        <form onSubmit={submit} className="space-y-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={studentInputClassName} placeholder="Titre (facultatif)" />
          <select required value={form.sessionId} onChange={e => { const item = sessions.find(s => String(s.sessionId) === e.target.value); setForm({ ...form, sessionId: e.target.value, formationId: String(item?.formationId || '') }) }} className={studentInputClassName}><option value="">Choisir une formation / session</option>{sessions.map(s => <option key={s.sessionId} value={s.sessionId}>{s.formationTitle} — {new Date(s.startDate).toLocaleDateString('fr-FR')}</option>)}</select>
          <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className={studentInputClassName}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} / 5 étoiles</option>)}</select>
          <textarea required rows={6} value={form.quote} onChange={e => setForm({ ...form, quote: e.target.value })} className={studentInputClassName} placeholder="Votre témoignage" />
          <label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.showName} onChange={e => setForm({ ...form, showName: e.target.checked })} /> Autoriser l'affichage de mon nom</label>
          <label className="flex gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.showPhoto} onChange={e => setForm({ ...form, showPhoto: e.target.checked })} /> Autoriser l'affichage de ma photo</label>
          {message && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
          <button className={studentPrimaryButtonClassName}><Send className="h-4 w-4" /> Envoyer pour validation</button>
        </form>
      </StudentSectionCard>
      <StudentSectionCard eyebrow="Suivi" title="Mes témoignages" description="Consultez les décisions et les réponses de l'administration." icon={Star}>
        {items.length === 0 ? <StudentEmptyState title="Aucun témoignage" description="Partagez votre expérience après une session suivie." /> : <div className="space-y-3">{items.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold text-slate-900">{item.title || 'Mon expérience'}</h3><span className="text-xs font-bold text-slate-500">{item.status === 'approved' ? '🟢 Publié' : item.status === 'rejected' ? '🔴 Refusé' : '🟡 En attente'}</span></div><p className="mt-2 text-sm text-slate-600">{item.quote}</p>{item.adminReply && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Réponse de l'administration : {item.adminReply}</p>}</article>)}</div>}
      </StudentSectionCard>
    </div>
  </StudentPageShell>
}
