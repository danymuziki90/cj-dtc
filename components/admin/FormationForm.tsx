'use client'

import { useState, useEffect } from 'react'
import { SaveIcon, Eye, EyeOff } from 'lucide-react'

const CATEGORIES = [
  { id: 'leadership-gouvernance',     label: 'Leadership & Gouvernance' },
  { id: 'employabilite-iop',          label: 'Employabilité & Insertion Professionnelle' },
  { id: 'ressources-humaines',        label: 'Ressources Humaines' },
  { id: 'developpement-personnel',    label: 'Développement Personnel' },
  { id: 'gestion-projets',            label: 'Gestion de Projets' },
  { id: 'entrepreneuriat',            label: 'Entrepreneuriat' },
  { id: 'transformation-digitale',    label: 'Transformation Digitale' },
  { id: 'intelligence-artificielle',  label: 'Intelligence Artificielle' },
  { id: 'forums-conferences',         label: 'Forums & Conférences' },
  { id: 'entreprises-institutions',   label: 'Formations Entreprises' },
]

const LEVELS = [
  { id: 'debutant',       label: 'Débutant' },
  { id: 'intermediaire',  label: 'Intermédiaire' },
  { id: 'avance',         label: 'Avancé' },
  { id: 'expert',         label: 'Expert' },
  { id: 'professionnel',  label: 'Professionnel (Executive)' },
]

const FORMATS = [
  { id: 'presentiel', label: 'Présentiel' },
  { id: 'en_ligne',   label: 'En ligne' },
  { id: 'hybride',    label: 'Hybride' },
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

interface Props {
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'

export default function FormationForm({ initialData, onSubmit, isSubmitting, submitLabel = 'Enregistrer' }: Props) {
  const isEdit = !!initialData?.id

  const [title, setTitle]             = useState(initialData?.title ?? '')
  const [slug, setSlug]               = useState(initialData?.slug ?? '')
  const [slugEdited, setSlugEdited]   = useState(false)
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [objectifs, setObjectifs]     = useState(initialData?.objectifs ?? '')
  const [duree, setDuree]             = useState(initialData?.duree ?? '')
  const [modules, setModules]         = useState(initialData?.modules ?? '')
  const [methodes, setMethodes]       = useState(initialData?.methodes ?? '')
  const [certification, setCertification] = useState(initialData?.certification ?? '')
  const [categorie, setCategorie]     = useState(initialData?.categorie ?? '')
  const [level, setLevel]             = useState(initialData?.level ?? '')
  const [format, setFormat]           = useState(initialData?.format ?? '')
  const [statut, setStatut]           = useState(initialData?.statut ?? 'brouillon')
  const [imageUrl, setImageUrl]       = useState(initialData?.imageUrl ?? '')
  const [activeTab, setActiveTab]     = useState<'general' | 'contenu' | 'pedagogie' | 'publication'>('general')

  // Auto-generate slug from title when creating
  useEffect(() => {
    if (!isEdit && !slugEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, isEdit, slugEdited])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ title, slug, description, objectifs, duree, modules, methodes, certification, categorie, level, format, statut, imageUrl })
  }

  const tabs = [
    { id: 'general',     label: 'Général' },
    { id: 'contenu',     label: 'Contenu' },
    { id: 'pedagogie',   label: 'Pédagogie' },
    { id: 'publication', label: 'Publication' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">

          {/* ── Onglet Général ── */}
          {activeTab === 'general' && (
            <>
              <Field label="Titre *" required>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="Ex : Management des Ressources Humaines"
                  className={inputCls} />
              </Field>

              <Field label="Slug (URL)" hint="Généré automatiquement depuis le titre">
                <input type="text" value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
                  placeholder="management-ressources-humaines"
                  className={`${inputCls} font-mono text-sm`} />
                <p className="text-xs text-gray-400 mt-1">
                  URL : /fr/formations/<strong>{slug || '…'}</strong>
                </p>
              </Field>

              <Field label="Description courte *" required>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required
                  rows={4} placeholder="Présentez la formation en 2-3 phrases…"
                  className={inputCls} />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Catégorie">
                  <select value={categorie} onChange={e => setCategorie(e.target.value)} className={inputCls}>
                    <option value="">— Sélectionner —</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </Field>

                <Field label="Durée" hint="Ex : 3 mois, 6 semaines, 2 jours">
                  <input type="text" value={duree} onChange={e => setDuree(e.target.value)}
                    placeholder="3 mois" className={inputCls} />
                </Field>

                <Field label="Niveau">
                  <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
                    <option value="">— Sélectionner —</option>
                    {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </Field>

                <Field label="Format">
                  <select value={format} onChange={e => setFormat(e.target.value)} className={inputCls}>
                    <option value="">— Sélectionner —</option>
                    {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Image (URL)" hint="Lien vers une image hébergée">
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://…/image.jpg" className={inputCls} />
                {imageUrl && (
                  <img src={imageUrl} alt="Aperçu" onError={e => (e.currentTarget.style.display = 'none')}
                    className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200" />
                )}
              </Field>
            </>
          )}

          {/* ── Onglet Contenu ── */}
          {activeTab === 'contenu' && (
            <>
              <Field label="Objectifs pédagogiques"
                hint="Un objectif par ligne — ce que l'apprenant sera capable de faire">
                <textarea value={objectifs} onChange={e => setObjectifs(e.target.value)}
                  rows={6} placeholder={"Développer une stratégie RH\nMaîtriser la gestion des talents\n…"}
                  className={inputCls} />
              </Field>

              <Field label="Modules / Programme"
                hint="Un module par ligne ou séparez par des virgules">
                <textarea value={modules} onChange={e => setModules(e.target.value)}
                  rows={6} placeholder={"Module 1 : Introduction\nModule 2 : Stratégie\n…"}
                  className={inputCls} />
              </Field>
            </>
          )}

          {/* ── Onglet Pédagogie ── */}
          {activeTab === 'pedagogie' && (
            <>
              <Field label="Méthodes pédagogiques"
                hint="Décrivez comment la formation est animée">
                <textarea value={methodes} onChange={e => setMethodes(e.target.value)}
                  rows={5} placeholder="Présentations interactives, études de cas, mises en situation…"
                  className={inputCls} />
              </Field>

              <Field label="Certification"
                hint="Décrivez le certificat ou diplôme délivré">
                <textarea value={certification} onChange={e => setCertification(e.target.value)}
                  rows={3} placeholder="Certificat de formation CJ DTC + Préparation SHRM-CP"
                  className={inputCls} />
              </Field>
            </>
          )}

          {/* ── Onglet Publication ── */}
          {activeTab === 'publication' && (
            <>
              <Field label="Statut de publication">
                <div className="flex gap-3">
                  {[
                    { id: 'brouillon', label: 'Brouillon', desc: 'Non visible sur le site', color: 'border-gray-300 text-gray-700' },
                    { id: 'publie',    label: 'Publié',    desc: 'Visible par tous',          color: 'border-green-400 text-green-700' },
                    { id: 'archive',   label: 'Archivé',   desc: 'Masqué mais conservé',       color: 'border-orange-400 text-orange-700' },
                  ].map(opt => (
                    <label key={opt.id}
                      className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        statut === opt.id ? `${opt.color} bg-opacity-5` : 'border-gray-200 text-gray-500'
                      }`}>
                      <input type="radio" name="statut" value={opt.id} checked={statut === opt.id}
                        onChange={() => setStatut(opt.id)} className="sr-only" />
                      <p className={`font-semibold text-sm ${statut === opt.id ? '' : 'text-gray-600'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </Field>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Rappel</p>
                <ul className="space-y-1 text-xs text-blue-600">
                  <li>• Seules les formations <strong>publiées</strong> apparaissent dans le catalogue.</li>
                  <li>• Un brouillon peut être prévisualisé via le lien direct.</li>
                  <li>• Une formation archivée ne peut plus recevoir d'inscriptions.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setStatut('brouillon')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Enregistrer brouillon
          </button>
        </div>
        <button type="submit" disabled={isSubmitting || !title}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children, required, hint }: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}
