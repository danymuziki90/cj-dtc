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

  // Champs de base (existants en DB)
  const [title, setTitle]                     = useState(initialData?.title ?? '')
  const [slug, setSlug]                       = useState(initialData?.slug ?? '')
  const [slugEdited, setSlugEdited]           = useState(false)
  const [description, setDescription]         = useState(initialData?.description ?? '')
  const [objectifs, setObjectifs]             = useState(initialData?.objectifs ?? '')
  const [duree, setDuree]                     = useState(initialData?.duree ?? '')
  const [modules, setModules]                 = useState(initialData?.modules ?? '')
  const [methodes, setMethodes]               = useState(initialData?.methodes ?? '')
  const [certification, setCertification]     = useState(initialData?.certification ?? '')
  const [categorie, setCategorie]             = useState(initialData?.categorie ?? '')
  const [level, setLevel]                     = useState(initialData?.level ?? '')
  const [format, setFormat]                   = useState(initialData?.format ?? '')
  const [statut, setStatut]                   = useState(initialData?.statut ?? 'brouillon')
  const [imageUrl, setImageUrl]               = useState(initialData?.imageUrl ?? '')

  // Nouveaux champs (synchronisation complete)
  const [name, setName]                       = useState(initialData?.name ?? '')
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? '')
  const [galleryText, setGalleryText]         = useState(
    Array.isArray(initialData?.gallery) ? (initialData.gallery as string[]).join('\n') : ''
  )
  const [skillsText, setSkillsText]           = useState(
    Array.isArray(initialData?.skillsAcquired) ? (initialData.skillsAcquired as string[]).join('\n') : ''
  )
  const [prerequisites, setPrerequisites]     = useState(initialData?.prerequisites ?? '')
  const [publicTargetsText, setPublicTargetsText] = useState(
    Array.isArray(initialData?.publicTargets) ? (initialData.publicTargets as string[]).join('\n') : ''
  )
  const [languages, setLanguages]             = useState<string[]>(
    Array.isArray(initialData?.languages) ? (initialData.languages as string[]) : ['fr']
  )

  const [activeTab, setActiveTab]             = useState<'general' | 'organisation' | 'contenu' | 'pedagogie' | 'publication'>('general')

  // Auto-generate slug from title when creating
  useEffect(() => {
    if (!isEdit && !slugEdited && title) {
      setSlug(slugify(title))
    }
  }, [title, isEdit, slugEdited])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      title,
      slug,
      description,
      objectifs,
      duree,
      modules,
      methodes,
      certification,
      categorie,
      statut,
      imageUrl,
      name: name || null,
      shortDescription: shortDescription || null,
      gallery: galleryText.split('\n').map(x => x.trim()).filter(Boolean),
      skillsAcquired: skillsText.split('\n').map(x => x.trim()).filter(Boolean),
      prerequisites: prerequisites || null,
      publicTargets: publicTargetsText.split('\n').map(x => x.trim()).filter(Boolean),
      level: level || null,
      format: format || null,
      languages
    })
  }

  const tabs = [
    { id: 'general',      label: 'Général' },
    { id: 'organisation', label: 'Organisation' },
    { id: 'contenu',      label: 'Contenu & Médias' },
    { id: 'pedagogie',    label: 'Pédagogie' },
    { id: 'publication',  label: 'Publication' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
              <Field label="Nom court / interne de la formation" hint="Nom simplifié ou abréviation (ex: MRH, IOP)">
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex : MRH"
                  className={inputCls} />
              </Field>

              <Field label="Titre officiel *" required>
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

              <Field label="Description courte (Accroche / Promesse) *" required>
                <input type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)} required
                  placeholder="Ex : Devenez un leader stratégique RH et pilotez la performance humaine."
                  className={inputCls} />
              </Field>
 
              <Field label="Description complète / Présentation *" required>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required
                  rows={6} placeholder="Présentation détaillée de la formation, de ses enjeux et de sa valeur ajoutée..."
                  className={inputCls} />
              </Field>
            </>
          )}

          {/* ── Onglet Organisation ── */}
          {activeTab === 'organisation' && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Catégorie">
                <select value={categorie} onChange={e => setCategorie(e.target.value)} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Field>
 
              <Field label="Durée indicative" hint="Ex : 3 mois, 6 semaines, 2 jours">
                <input type="text" value={duree} onChange={e => setDuree(e.target.value)}
                  placeholder="3 mois" className={inputCls} />
              </Field>
 
              <Field label="Niveau requis / cible">
                <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </Field>
 
              <Field label="Format disponible">
                <select value={format} onChange={e => setFormat(e.target.value)} className={inputCls}>
                  <option value="">— Sélectionner —</option>
                  {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Certifications délivrées" hint="Ex : Certificat de formation professionnelle CJ DTC">
                  <input type="text" value={certification} onChange={e => setCertification(e.target.value)}
                    placeholder="Certificat de formation CJ DTC + Préparation SHRM-CP" className={inputCls} />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Langues disponibles">
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={languages.includes('fr')} onChange={e => {
                        if (e.target.checked) setLanguages([...languages, 'fr'])
                        else setLanguages(languages.filter(l => l !== 'fr'))
                      }} className="rounded text-blue-600 focus:ring-blue-500" />
                      Français
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={languages.includes('en')} onChange={e => {
                        if (e.target.checked) setLanguages([...languages, 'en'])
                        else setLanguages(languages.filter(l => l !== 'en'))
                      }} className="rounded text-blue-600 focus:ring-blue-500" />
                      Anglais
                    </label>
                  </div>
                </Field>
              </div>
            </div>
          )}
 
          {/* ── Onglet Contenu & Médias ── */}
          {activeTab === 'contenu' && (
            <>
              <Field label="Image de couverture (URL)" hint="Lien vers une image hébergée représentant la formation">
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://…/image.jpg" className={inputCls} />
                {imageUrl && (
                  <img src={imageUrl} alt="Aperçu couverture" onError={e => (e.currentTarget.style.display = 'none')}
                    className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200" />
                )}
              </Field>

              <Field label="Galerie d'images (Optionnel)" hint="Entrez une URL d'image par ligne">
                <textarea value={galleryText} onChange={e => setGalleryText(e.target.value)}
                  rows={4} placeholder="https://…/photo1.jpg&#10;https://…/photo2.jpg"
                  className={inputCls} />
                {galleryText.split('\n').filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {galleryText.split('\n').filter(Boolean).map((url, i) => (
                      <img key={i} src={url.trim()} alt={`Aperçu galerie ${i+1}`} onError={e => (e.currentTarget.style.display = 'none')}
                        className="h-14 w-20 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </Field>
 
              <Field label="Programme / Modules" hint="Un module par ligne">
                <textarea value={modules} onChange={e => setModules(e.target.value)}
                  rows={6} placeholder={"Module 1 : Introduction générale\nModule 2 : Approfondissement opérationnel\n…"}
                  className={inputCls} />
              </Field>
            </>
          )}
 
          {/* ── Onglet Pédagogie ── */}
          {activeTab === 'pedagogie' && (
            <>
              <Field label="Objectifs pédagogiques"
                hint="Un objectif par ligne — ce que l'apprenant sera capable de faire">
                <textarea value={objectifs} onChange={e => setObjectifs(e.target.value)}
                  rows={4} placeholder={"Développer une stratégie RH globale\nMaîtriser les bases du recrutement\n…"}
                  className={inputCls} />
              </Field>

              <Field label="Compétences développées"
                hint="Une compétence par ligne">
                <textarea value={skillsText} onChange={e => setSkillsText(e.target.value)}
                  rows={4} placeholder={"Négociation sociale\nAudit organisationnel\n…"}
                  className={inputCls} />
              </Field>

              <Field label="Prérequis"
                hint="Connaissances ou diplômes nécessaires pour suivre le cours">
                <textarea value={prerequisites} onChange={e => setPrerequisites(e.target.value)}
                  rows={3} placeholder="Avoir une expérience managériale de base ou un niveau d'études Bac+2."
                  className={inputCls} />
              </Field>

              <Field label="Public cible"
                hint="Un public par ligne">
                <textarea value={publicTargetsText} onChange={e => setPublicTargetsText(e.target.value)}
                  rows={4} placeholder={"Directeurs opérationnels\nManagers d'équipes\nCollaborateurs RH"}
                  className={inputCls} />
              </Field>
 
              <Field label="Méthodes pédagogiques"
                hint="Décrivez comment la formation est animée (ex. ateliers interactifs, mises en situation)">
                <textarea value={methodes} onChange={e => setMethodes(e.target.value)}
                  rows={4} placeholder="Présentations interactives, études de cas réels, simulations pratiques…"
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
                  <li>• Seules les formations <strong>publiées</strong> apparaissent dans le catalogue public.</li>
                  <li>• Les brouillons peuvent être édités et prévisualisés par l'administration.</li>
                  <li>• Une formation archivée ne peut plus recevoir de nouvelles sessions ni d'inscriptions.</li>
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
