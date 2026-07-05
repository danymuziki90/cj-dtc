'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, Download, FileText, Filter, GraduationCap, Layers3 } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  type StudentMetric,
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
}

interface Formation {
  id: number
  title: string
}

export default function SupportsPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'
  const searchParams = useSearchParams()

  const [documents, setDocuments] = useState<Document[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFormation, setSelectedFormation] = useState<string>(searchParams.get('formationId') || '')

  useEffect(() => {
    fetchFormations()
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [selectedFormation])

  const metrics = useMemo<StudentMetric[]>(() => {
    const categoriesCount = new Set(documents.map((document) => document.category)).size
    return [
      {
        label: 'Supports',
        value: documents.length,
        helper: 'Documents actuellement disponibles.',
        icon: BookOpen,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Formations',
        value: formations.length,
        helper: 'Parcours proposes dans la bibliotheque.',
        icon: GraduationCap,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Categories',
        value: categoriesCount,
        helper: 'Types de ressources accessibles.',
        icon: Layers3,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [documents, formations.length])

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/formations')
      const data = await response.json()
      setFormations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('isPublic', 'true')
      if (selectedFormation) {
        params.append('formationId', selectedFormation)
      }

      const response = await fetch(`/api/documents?${params}`)
      const data = await response.json()
      setDocuments(data)
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
    const map: Record<string, { label: string; icon: typeof BookOpen }> = {
      syllabus: { label: 'Syllabus', icon: BookOpen },
      presentation: { label: 'Presentation', icon: Layers3 },
      exercise: { label: 'Exercice', icon: GraduationCap },
      resource: { label: 'Ressource', icon: FileText },
      certificate_template: { label: 'Modele de certificat', icon: Award },
    }

    return map[category] || { label: category, icon: FileText }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Supports pedagogiques"
        description="Chargement des documents, des categories et des formations rattachees a votre bibliotheque."
        icon={BookOpen}
      >
        <StudentSectionCard
          eyebrow="Bibliotheque"
          title="Preparation des ressources"
          description="Nous recuperons les documents accessibles pour votre parcours."
          icon={FileText}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement des supports...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Supports pedagogiques"
      description="Telechargez vos ressources de cours, filtrez-les par formation et gardez une vue claire sur votre bibliotheque d'apprentissage."
      icon={BookOpen}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="Filtre"
        title="Explorer les supports"
        description="Affinez la bibliotheque par formation pour afficher uniquement les ressources pertinentes a votre parcours."
        icon={Filter}
      >
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">Filtrer par formation</label>
            <select
              value={selectedFormation}
              onChange={(event) => setSelectedFormation(event.target.value)}
              className={studentInputClassName}
            >
              <option value="">Toutes les formations</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id.toString()}>
                  {formation.title}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Utilisez ce filtre pour retrouver rapidement les ressources associees a une formation precise.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Raccourcis utiles</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/espace-etudiants/travaux`} className={studentMutedButtonClassName}>
                Aller aux travaux
              </Link>
              <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                Retour au dashboard
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Conseil</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Conservez localement les documents telecharges les plus utilises pour travailler hors connexion si besoin.
              </p>
            </div>
          </div>
        </div>
      </StudentSectionCard>

      <StudentSectionCard
        eyebrow="Documents"
        title="Bibliotheque disponible"
        description="Chaque support affiche sa categorie, sa formation de rattachement et un acces direct au telechargement."
        icon={FileText}
      >
        {documents.length === 0 ? (
          <StudentEmptyState
            title="Aucun support disponible"
            description="Aucun document ne correspond au filtre actuel. Essayez une autre formation ou revenez a l'ensemble des ressources."
            action={
              <button onClick={() => setSelectedFormation('')} className={studentPrimaryButtonClassName}>
                Reinitialiser le filtre
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => {
              const category = getCategoryMeta(document.category)
              const CategoryIcon = category.icon

              return (
                <div
                  key={document.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cj-blue-50)] text-[var(--cj-blue)] transition group-hover:bg-[var(--cj-blue)] group-hover:text-white">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[var(--cj-blue)]">
                      {category.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{document.title}</h3>
                  {document.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{document.description}</p>
                  ) : null}

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <p>{document.formation ? `Formation: ${document.formation.title}` : 'Document transversal'}</p>
                    <p>Taille: {formatFileSize(document.fileSize)}</p>
                    <p>Ajoute le {new Date(document.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-400">{document.fileName}</span>
                    <a href={`/${document.filePath}`} download={document.fileName} className={studentPrimaryButtonClassName}>
                      <Download className="h-4 w-4" />
                      Telecharger
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  )
}
