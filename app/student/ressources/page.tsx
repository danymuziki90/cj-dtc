'use client'

import Link from 'next/link'
import { BookOpen, Download, FolderOpen, Layers3, Sparkles } from 'lucide-react'
import {
  StudentEmptyState,
  StudentSectionCard,
  type StudentMetric,
} from '@/components/ui/student-space'
import { StudentPortalError, StudentPortalLoading, StudentPortalPageShell } from '@/components/student-portal/StudentPortalPageShell'
import { useStudentDashboardData } from '@/components/student-portal/useStudentDashboard'
import { formatPortalDate } from '@/lib/student-portal/format'

function categoryLabel(value: string) {
  if (value === 'syllabus') return 'Programme'
  if (value === 'presentation') return 'Presentation'
  if (value === 'exercise') return 'Exercice'
  if (value === 'resource') return 'Ressource'
  return value
}

export default function StudentResourcesPage() {
  const { data, loading, error } = useStudentDashboardData()

  if (loading) {
    return <StudentPortalLoading title="Ressources" description="Accedez a vos supports, documents et fichiers pedagogiques." icon={BookOpen} />
  }

  if (!data || error) {
    return <StudentPortalError title="Ressources" description="Accedez a vos supports, documents et fichiers pedagogiques." icon={BookOpen} error={error} />
  }

  const resources = data.dashboard.resources
  const categories = Array.from(new Set(resources.map((item) => item.category)))
  const metrics: StudentMetric[] = [
    {
      label: 'Documents',
      value: resources.length,
      helper: 'Bibliotheque accessible selon vos sessions actives.',
      icon: FolderOpen,
      accent: 'from-[#002D72] to-[#0C4DA2]',
    },
    {
      label: 'Categories',
      value: categories.length,
      helper: 'Typologies de contenus disponibles.',
      icon: Layers3,
      accent: 'from-[#0C4DA2] to-[#4F8FE8]',
    },
    {
      label: 'Publics',
      value: resources.filter((item) => item.isPublic).length,
      helper: 'Documents partages pour consultation simple.',
      icon: Sparkles,
      accent: 'from-[#E30613] to-[#F16C78]',
    },
    {
      label: 'Recents',
      value: resources.filter((item) => Date.now() - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30).length,
      helper: 'Ajouts sur les 30 derniers jours.',
      icon: Download,
      accent: 'from-[#001737] to-[#002D72]',
    },
  ]

  return (
    <StudentPortalPageShell
      title="Ressources pedagogiques"
      description="Tous les supports, exercices et documents utiles a votre session se trouvent ici, organises par categorie."
      icon={BookOpen}
      metrics={metrics}
    >
      <StudentSectionCard
        eyebrow="Bibliotheque"
        title="Documents disponibles"
        description="Les ressources sont filtrees automatiquement selon vos inscriptions et sessions actives."
        icon={FolderOpen}
      >
        {resources.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {resources.map((resource) => (
              <article key={resource.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--cj-red)]">{categoryLabel(resource.category)}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{resource.title}</h3>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {resource.isPublic ? 'Partage' : 'Prive'}
                  </span>
                </div>
                {resource.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p> : null}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{resource.formation?.title || 'Toutes vos formations'}</p>
                    <p className="mt-1">Ajoute le {formatPortalDate(resource.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{resource.session?.location || 'Session non specifiee'}</p>
                    <p className="mt-1">{resource.fileName}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`/${resource.filePath}`}
                    download={resource.fileName}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[var(--cj-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--cj-blue-700)]"
                  >
                    <Download className="h-4 w-4" />
                    Telecharger
                  </a>
                  <Link
                    href="/student/mes-sessions"
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[var(--cj-blue)]"
                  >
                    Voir mes sessions
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <StudentEmptyState
            title="Aucune ressource disponible"
            description="Vos supports s'afficheront ici des qu'un document sera publie pour votre formation ou votre session."
          />
        )}
      </StudentSectionCard>
    </StudentPortalPageShell>
  )
}
