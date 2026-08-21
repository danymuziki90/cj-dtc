'use client'

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Archive, Copy,
  Search, Filter, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, AlertCircle, X, MapPin, Briefcase, Calendar,
  Building2, Globe, GraduationCap, Clock, DollarSign, Mail, Link as LinkIcon,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type EmploiMeta = {
  company: string; contractType: string; location: string; remote: string
  domain: string; educationLevel: string; experience: string; salary: string
  positions: number; deadline: string; applyUrl: string; contactEmail: string
  whereToApply: string; howToApply: string
  missions: string; profile: string; skills: string; status: string; excerpt: string
}
type Emploi = {
  id: string; title: string; content: string; published: boolean
  publicationDate: string; createdAt: string; imageDataUrl: string | null
  tags: string[]; metadata: EmploiMeta
}
type Pagination = { page: number; pageSize: number; total: number; pageCount: number }

// ─── Form state ───────────────────────────────────────────────────────────────
type FormState = {
  title: string; content: string; tagsInput: string
  publicationDate: string; imageDataUrl: string | null; published: boolean
  company: string; contractType: string; location: string; remote: string
  domain: string; educationLevel: string; experience: string; salary: string
  positions: string; deadline: string; applyUrl: string; contactEmail: string
  whereToApply: string; howToApply: string
  missions: string; profile: string; skills: string; excerpt: string
}

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Freelance', 'Intérim', 'Alternance', 'Bénévolat', 'Autre']
const REMOTE_OPTIONS = [{ value: 'non', label: 'Présentiel' }, { value: 'oui', label: 'Télétravail' }, { value: 'hybride', label: 'Hybride' }]
const EDUCATION_LEVELS = ['Bac', 'Bac+2', 'Bac+3 / Licence', 'Bac+5 / Master', 'Doctorat', 'Sans diplôme requis']
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published: { label: 'Publié',   color: 'bg-emerald-100 text-emerald-700' },
  draft:     { label: 'Brouillon', color: 'bg-amber-100 text-amber-700' },
  archived:  { label: 'Archivé',  color: 'bg-slate-100 text-slate-600' },
}

function emptyForm(): FormState {
  return {
    title: '', content: '', tagsInput: '', published: false,
    publicationDate: new Date().toISOString().slice(0, 10),
    imageDataUrl: null,
    company: '', contractType: '', location: '', remote: 'non',
    domain: '', educationLevel: '', experience: '', salary: '',
    positions: '1', deadline: '', applyUrl: '', contactEmail: '',
    whereToApply: '', howToApply: '',
    missions: '', profile: '', skills: '', excerpt: '',
  }
}

function formToPayload(f: FormState, status: string) {
  return {
    title: f.title.trim(),
    content: f.content.trim() || '<p>Description du poste.</p>',
    tags: f.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    publicationDate: f.publicationDate,
    imageDataUrl: f.imageDataUrl,
    published: status === 'published',
    metadata: {
      company: f.company, contractType: f.contractType, location: f.location,
      remote: f.remote, domain: f.domain, educationLevel: f.educationLevel,
      experience: f.experience, salary: f.salary,
      positions: parseInt(f.positions) || 1,
      deadline: f.deadline, applyUrl: f.applyUrl, contactEmail: f.contactEmail,
      whereToApply: f.whereToApply, howToApply: f.howToApply,
      missions: f.missions, profile: f.profile, skills: f.skills,
      excerpt: f.excerpt, status,
    },
  }
}

const MAX_IMG = 2 * 1024 * 1024

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminEmploisPage() {
  const [emplois, setEmplois]       = useState<Emploi[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 9, total: 0, pageCount: 1 })
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState<string | null>(null)
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState<FormState>(emptyForm())
  const [formStatus, setFormStatus] = useState<string>('draft')
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]             = useState(1)
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  const f = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  // ── Load list ──────────────────────────────────────────────────────────────
  const load = useCallback(async (p = page) => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(p), pageSize: '9' })
    if (search) qs.set('search', search)
    if (statusFilter) qs.set('status', statusFilter)
    try {
      const res = await fetch(`/api/admin/system/emplois?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Chargement impossible.')
      const data = await res.json()
      setEmplois(data.emplois || [])
      setPagination(data.pagination)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { load(page) }, [page, search, statusFilter])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function toast(msg: string, isError = false) {
    if (isError) setError(msg); else setSuccess(msg)
    setTimeout(() => { setError(null); setSuccess(null) }, 5000)
  }

  function openCreate() {
    setEditingId(null); setForm(emptyForm()); setFormStatus('draft'); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openEdit(e: Emploi) {
    setEditingId(e.id)
    setFormStatus(e.metadata.status || (e.published ? 'published' : 'draft'))
    setForm({
      title: e.title, content: e.content,
      tagsInput: e.tags.join(', '),
      publicationDate: e.publicationDate.slice(0, 10),
      imageDataUrl: e.imageDataUrl || null,
      published: e.published,
      company: e.metadata.company || '', contractType: e.metadata.contractType || '',
      location: e.metadata.location || '', remote: e.metadata.remote || 'non',
      domain: e.metadata.domain || '', educationLevel: e.metadata.educationLevel || '',
      experience: e.metadata.experience || '', salary: e.metadata.salary || '',
      positions: String(e.metadata.positions || 1), deadline: e.metadata.deadline || '',
      applyUrl: e.metadata.applyUrl || '', contactEmail: e.metadata.contactEmail || '',
      whereToApply: e.metadata.whereToApply || '', howToApply: e.metadata.howToApply || '',
      missions: e.metadata.missions || '', profile: e.metadata.profile || '',
      skills: e.metadata.skills || '', excerpt: e.metadata.excerpt || '',
    })
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() { setShowForm(false); setEditingId(null); setForm(emptyForm()) }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const payload = formToPayload(form, formStatus)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url    = editingId ? `/api/admin/system/emplois/${editingId}` : '/api/admin/system/emplois'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Enregistrement impossible.') }
      toast(editingId ? 'Offre mise à jour !' : 'Offre créée !'); closeForm(); load(page)
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function patch(id: string, action: string) {
    const res = await fetch(`/api/admin/system/emplois/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
    })
    if (!res.ok) { const d = await res.json(); toast(d.error || 'Action impossible.', true); return }
    const label = action === 'publish' ? 'Offre publiée.' : action === 'unpublish' ? 'Offre dépubliée.' : action === 'archive' ? 'Offre archivée.' : 'Offre dupliquée.'
    toast(label); load(page)
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer cette offre ? Action irréversible.')) return
    const res = await fetch(`/api/admin/system/emplois/${id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); toast(d.error || 'Suppression impossible.', true); return }
    toast('Offre supprimée.'); load(page)
  }

  // ── Image ──────────────────────────────────────────────────────────────────
  async function onImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    if (!file.type.startsWith('image/')) return toast('Fichier image requis.', true)
    if (file.size > MAX_IMG) return toast('Image trop volumineuse (max 2 Mo).', true)
    const reader = new FileReader()
    reader.onload = () => setForm(p => ({ ...p, imageDataUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  // ─── Input helpers ─────────────────────────────────────────────────────────
  function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
      </div>
    )
  }

  const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[var(--cj-blue)] focus:ring-1 focus:ring-[var(--cj-blue)]'
  const selectCls = inputCls
  const textareaCls = `${inputCls} resize-y min-h-[90px]`

  return (
    <AdminShell title="Offres d'emploi">
      {/* Toast messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Modifier l\'offre' : 'Nouvelle offre d\'emploi'}</h2>
            <button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>

          {/* Statut */}
          <div className="flex flex-wrap gap-2">
            {(['draft', 'published', 'archived'] as const).map(s => (
              <button key={s} type="button" onClick={() => setFormStatus(s)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold border transition ${formStatus === s ? STATUS_LABELS[s].color + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                {STATUS_LABELS[s].label}
              </button>
            ))}
          </div>

          {/* Section 1 : Informations générales */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Informations générales</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Titre du poste" required>
                <input className={inputCls} value={form.title} onChange={f('title')} required placeholder="Ex : Développeur Full Stack" />
              </Field>
              <Field label="Entreprise">
                <input className={inputCls} value={form.company} onChange={f('company')} placeholder="Nom de l'entreprise" />
              </Field>
              <Field label="Secteur d'activité">
                <input className={inputCls} value={form.domain} onChange={f('domain')} placeholder="Ex : Finance, IT, RH…" />
              </Field>
              <Field label="Localisation">
                <input className={inputCls} value={form.location} onChange={f('location')} placeholder="Ville, Pays" />
              </Field>
              <Field label="Type de contrat">
                <select className={selectCls} value={form.contractType} onChange={f('contractType')}>
                  <option value="">-- Sélectionner --</option>
                  {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Télétravail">
                <select className={selectCls} value={form.remote} onChange={f('remote')}>
                  {REMOTE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Niveau d'études">
                <select className={selectCls} value={form.educationLevel} onChange={f('educationLevel')}>
                  <option value="">-- Sélectionner --</option>
                  {EDUCATION_LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Expérience requise">
                <input className={inputCls} value={form.experience} onChange={f('experience')} placeholder="Ex : 2 ans minimum" />
              </Field>
              <Field label="Salaire (optionnel)">
                <input className={inputCls} value={form.salary} onChange={f('salary')} placeholder="Ex : 800 000 XAF / mois" />
              </Field>
              <Field label="Nombre de postes">
                <input className={inputCls} type="number" min="1" value={form.positions} onChange={f('positions')} />
              </Field>
              <Field label="Date limite de candidature">
                <input className={inputCls} type="date" value={form.deadline} onChange={f('deadline')} />
              </Field>
              <Field label="Date de publication">
                <input className={inputCls} type="date" value={form.publicationDate} onChange={f('publicationDate')} />
              </Field>
            </div>
          </div>

          {/* Section 2 : Description */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Description du poste</p>
            <Field label="Résumé / Accroche (max 400 car.)">
              <textarea className={textareaCls} value={form.excerpt} onChange={f('excerpt')} maxLength={400} rows={2} placeholder="Courte description affichée dans les cartes" />
            </Field>
            <Field label="Description complète" required>
              <textarea className={textareaCls} value={form.content} onChange={f('content')} rows={5} required placeholder="Description complète du poste…" />
            </Field>
            <Field label="Missions principales">
              <textarea className={textareaCls} value={form.missions} onChange={f('missions')} rows={4} placeholder="• Mission 1&#10;• Mission 2…" />
            </Field>
            <Field label="Profil recherché">
              <textarea className={textareaCls} value={form.profile} onChange={f('profile')} rows={4} placeholder="Décrivez le profil idéal…" />
            </Field>
            <Field label="Compétences requises">
              <textarea className={textareaCls} value={form.skills} onChange={f('skills')} rows={3} placeholder="• Compétence 1&#10;• Compétence 2…" />
            </Field>
          </div>

          {/* Section 3 : Candidature */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Candidature</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Lien de candidature (URL)">
                <input className={inputCls} type="url" value={form.applyUrl} onChange={f('applyUrl')} placeholder="https://…" />
              </Field>
              <Field label="Email de contact">
                <input className={inputCls} type="email" value={form.contactEmail} onChange={f('contactEmail')} placeholder="recrutement@example.com" />
              </Field>
            </div>
            <Field label="Où postuler">
              <input className={inputCls} value={form.whereToApply} onChange={f('whereToApply')} placeholder="Ex : sur notre site, au bureau, via LinkedIn…" />
            </Field>
            <Field label="Comment postuler">
              <textarea className={textareaCls} value={form.howToApply} onChange={f('howToApply')} rows={4} placeholder="Décrivez les étapes pour postuler : envoyer un CV à…, remplir le formulaire sur…, etc." />
            </Field>
          </div>

          {/* Section 4 : Médias */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Image & Tags</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Image / Logo (optionnel)">
                <input type="file" accept="image/*" onChange={onImageChange} className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--cj-blue)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-800" />
                {form.imageDataUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={form.imageDataUrl} alt="preview" className="h-16 w-24 rounded-lg object-cover border border-slate-200" />
                    <button type="button" onClick={() => setForm(p => ({ ...p, imageDataUrl: null }))} className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </div>
                )}
              </Field>
              <Field label="Tags (séparés par virgule)">
                <input className={inputCls} value={form.tagsInput} onChange={f('tagsInput')} placeholder="RH, Finance, Kinshasa…" />
              </Field>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-900 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer l\'offre'}
            </button>
            <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      {!showForm && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Rechercher une offre…"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)] focus:ring-1 focus:ring-[var(--cj-blue)]" />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[var(--cj-blue)]">
              <option value="">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-blue-900">
            <Plus className="h-4 w-4" /> Nouvelle offre
          </button>
        </div>
      )}

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      {!showForm && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: pagination.total, color: 'text-[var(--cj-blue)]' },
            { label: 'Publiées', value: emplois.filter(e => e.published).length, color: 'text-emerald-600' },
            { label: 'Brouillons', value: emplois.filter(e => !e.published && e.metadata.status !== 'archived').length, color: 'text-amber-600' },
            { label: 'Archivées', value: emplois.filter(e => e.metadata.status === 'archived').length, color: 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── List ──────────────────────────────────────────────────────────── */}
      {!showForm && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
            </div>
          ) : emplois.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">Aucune offre trouvée</p>
              <p className="text-sm text-slate-500 mt-1">Créez votre première offre d'emploi.</p>
              <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--cj-blue)] px-5 py-2.5 text-sm font-bold text-white">
                <Plus className="h-4 w-4" /> Créer une offre
              </button>
            </div>
          ) : emplois.map(e => (
            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start gap-3">
                {e.imageDataUrl && (
                  <img src={e.imageDataUrl} alt={e.title} className="h-14 w-20 rounded-xl object-cover border border-slate-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_LABELS[e.metadata.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_LABELS[e.metadata.status]?.label || e.metadata.status}
                    </span>
                    {e.metadata.contractType && <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">{e.metadata.contractType}</span>}
                    {e.metadata.remote !== 'non' && <span className="inline-block rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">{e.metadata.remote === 'oui' ? 'Télétravail' : 'Hybride'}</span>}
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{e.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                    {e.metadata.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{e.metadata.company}</span>}
                    {e.metadata.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.metadata.location}</span>}
                    {e.metadata.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Limite : {e.metadata.deadline}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 shrink-0 mt-2 sm:mt-0">
                  <button onClick={() => openEdit(e)} title="Modifier"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  {e.metadata.status !== 'published' && (
                    <button onClick={() => patch(e.id, 'publish')} title="Publier"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
                      <Eye className="h-3.5 w-3.5" /> Publier
                    </button>
                  )}
                  {e.metadata.status === 'published' && (
                    <button onClick={() => patch(e.id, 'unpublish')} title="Dépublier"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100">
                      <EyeOff className="h-3.5 w-3.5" /> Dépublier
                    </button>
                  )}
                  {e.metadata.status !== 'archived' && (
                    <button onClick={() => patch(e.id, 'archive')} title="Archiver"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                      <Archive className="h-3.5 w-3.5" /> Archiver
                    </button>
                  )}
                  <button onClick={() => patch(e.id, 'duplicate')} title="Dupliquer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(e.id)} title="Supprimer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {!showForm && pagination.pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${n === page ? 'border-[var(--cj-blue)] bg-[var(--cj-blue)] text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{n}</button>
          ))}
          <button disabled={page >= pagination.pageCount} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </AdminShell>
  )
}
