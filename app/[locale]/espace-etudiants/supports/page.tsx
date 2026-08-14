'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { BookOpen, Download, ExternalLink, FileText, Filter, GraduationCap, Layers3, Video, FileArchive, ChevronDown, Loader2 } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
} from '@/components/ui/student-space'

interface Document {
  id: number
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  category: string
  createdAt: string
  formation: {
    id: number
    title: string
  } | null
  session: {
    id: number
    startDate: string
    endDate: string
    location: string | null
  } | null
}

interface Formation {
  id: number
  title: string
}

function SupportsContent() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const searchParams = useSearchParams()

  const [documents, setDocuments] = useState<Document[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState<string>(searchParams.get('formationId') || '')
  const [openSessions, setOpenSessions] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchFormations()
  }, [])

  useEffect(() => {
    fetchDocuments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormation])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      if (!response.ok) return
      const data = await response.json()
      setFormations(Array.isArray(data) ? data : (Array.isArray(data?.formations) ? data.formations : []))
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('isPublic', 'true')
      params.append('scope', 'pedagogical')
      if (selectedFormation) {
        params.append('formationId', selectedFormation)
      }

      const response = await fetch(`/api/documents?${params}`)
      if (!response.ok) {
        setDocuments([])
        return
      }
      const data = await response.json()
      const list: Document[] = Array.isArray(data) ? data : []
      setDocuments(list)
      // Par défaut, ouvrir toutes les sessions pour une navigation plus fluide
      setOpenSessions(Object.fromEntries(list.filter((item) => item.session).map((item) => [item.session!.id, true])))
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
  }

  const getCategoryMeta = (category: string) => {
    const map: Record<string, { label: string; icon: any }> = {
      syllabus: { label: 'Syllabus', icon: BookOpen },
      cours: { label: 'Cours', icon: BookOpen },
      tp: { label: 'TP', icon: GraduationCap },
      guide: { label: 'Guide', icon: FileText },
      presentation: { label: 'Présentation', icon: Layers3 },
      exercise: { label: 'Exercice', icon: GraduationCap },
      resource: { label: 'Ressource', icon: FileText },
      pdf: { label: 'Document PDF', icon: FileText },
      word: { label: 'Document Word', icon: FileText },
      powerpoint: { label: 'PowerPoint', icon: Layers3 },
      zip: { label: 'Archive ZIP', icon: FileArchive },
      video: { label: 'Support Vidéo', icon: Video },
      other: { label: 'Support de cours', icon: FileText },
    }

    return map[category] || { label: category, icon: FileText }
  }

  const sessionGroups = useMemo(() => {
    const groups = new Map<number, { session: NonNullable<Document['session']>; formation: Document['formation']; documents: Document[] }>()
    documents.forEach((document) => {
      if (!document.session) return
      const current = groups.get(document.session.id)
      if (current) current.documents.push(document)
      else groups.set(document.session.id, { session: document.session, formation: document.formation, documents: [document] })
    })
    return Array.from(groups.values())
  }, [documents])

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace étudiant"
        title="Supports pédagogiques"
        description="Chargement des documents et des ressources de votre bibliothèque..."
        icon={BookOpen}
      >
        <div className="flex justify-center items-center py-20 text-slate-500 text-sm">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span>Récupération des supports...</span>
        </div>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace étudiant"
      title="Supports pédagogiques"
      description="Accédez aux ressources mises à votre disposition par CJ Development pour accompagner votre parcours."
      icon={BookOpen}
    >
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        
        {/* Filtre Formations (gauche sur desktop, haut sur mobile) */}
        <div className="lg:col-span-1 space-y-4">
          <StudentSectionCard
            eyebrow="Filtre"
            title="Explorer les supports"
            description="Affinez la bibliothèque par formation."
            icon={Filter}
          >
            <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-4 sm:p-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700">Filtrer par formation</label>
              <select
                value={selectedFormation}
                onChange={(event) => setSelectedFormation(event.target.value)}
                className={`${studentInputClassName} text-xs py-2.5`}
              >
                <option value="">Toutes les formations</option>
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id.toString()}>
                    {formation.title}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Utilisez ce filtre pour retrouver rapidement les ressources associées à une formation précise.
              </p>
            </div>
            
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--cj-red)]">Raccourcis</p>
              <Link href={`/${locale}/espace-etudiants`} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
                Retour au dashboard
              </Link>
            </div>
          </StudentSectionCard>
        </div>

        {/* Bibliothèque (droite sur desktop, bas sur mobile) */}
        <div className="lg:col-span-2">
          <StudentSectionCard
            eyebrow="Documents"
            title="Bibliothèque de ressources"
            description="Consultez et téléchargez les supports de cours de vos sessions."
            icon={FileText}
          >
            {documents.length === 0 ? (
              <StudentEmptyState
                title="Aucun support disponible"
                description="Aucun document ne correspond au filtre actuel. Essayez une autre formation ou revenez à l'ensemble des ressources."
                action={
                  <button onClick={() => setSelectedFormation('')} className={studentPrimaryButtonClassName}>
                    Réinitialiser le filtre
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {sessionGroups.map((group) => (
                  <section key={group.session.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                    <button
                      type="button"
                      onClick={() => setOpenSessions((current) => ({ ...current, [group.session.id]: !current[group.session.id] }))}
                      className="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100/50 sm:px-5 sm:py-4 transition-colors border-b border-slate-100"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-bold uppercase tracking-widest text-[var(--cj-red)]" title={group.formation?.title || 'Formation'}>
                          {group.formation?.title || 'Formation'}
                        </p>
                        <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 sm:text-base">
                          Session du {new Date(group.session.startDate).toLocaleDateString('fr-FR')}
                        </h3>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
                          {group.documents.length} support{group.documents.length > 1 ? 's' : ''}{group.session.location ? ` · ${group.session.location}` : ''}
                        </p>
                      </div>
                      <ChevronDown className={`shrink-0 h-4 w-4 text-slate-400 transition-transform ${openSessions[group.session.id] ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openSessions[group.session.id] && (
                      <div className="grid gap-3 bg-white p-3 sm:p-4 md:grid-cols-2">
                        {group.documents.map((document) => {
                          const category = getCategoryMeta(document.category)
                          const CategoryIcon = category.icon

                          return (
                            <div
                              key={document.id}
                              className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                            >
                              {/* Header carte document */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--cj-blue)] transition group-hover:bg-[var(--cj-blue)] group-hover:text-white">
                                  <CategoryIcon className="h-4 w-4" />
                                </div>
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[var(--cj-blue)] whitespace-nowrap">
                                  {category.label}
                                </span>
                              </div>

                              <h3 className="mt-3 break-words text-sm font-bold text-slate-900 leading-snug sm:text-base">
                                {document.title}
                              </h3>
                              {document.description && (
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                  {document.description}
                                </p>
                              )}

                              <div className="mt-3 space-y-1 text-[11px] text-slate-500 font-medium">
                                <p className="flex justify-between border-b border-slate-50 pb-1">
                                  <span>Taille</span>
                                  <span className="text-slate-700">{formatFileSize(document.fileSize)}</span>
                                </p>
                                <p className="flex justify-between pt-1">
                                  <span>Ajouté le</span>
                                  <span className="text-slate-700">{new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
                                </p>
                              </div>

                              <div className="mt-auto pt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <a 
                                  href={`/api/documents/${document.id}`} 
                                  download={document.fileName} 
                                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--cj-blue)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--cj-blue-700)] sm:w-auto sm:flex-1"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Télécharger
                                </a>
                                {['application/pdf', 'video/'].some((type) => document.mimeType.startsWith(type)) && (
                                  <a 
                                    href={`/api/documents/${document.id}?disposition=inline`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                                    aria-label={`Ouvrir ${document.title}`}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Ouvrir
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </StudentSectionCard>
        </div>
      </div>
    </StudentPageShell>
  )
}

export default function SupportsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <SupportsContent />
    </Suspense>
  )
}
