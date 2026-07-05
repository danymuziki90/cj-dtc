'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ExternalLink, FolderOpen, Gauge, Laptop, Layers3, ShieldCheck } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentSurfaceButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'

interface Course {
  id: number
  title: string
  description: string
  progress: number
  modules: number
  completedModules: number
  lmsUrl: string | null
}

export default function ElearningPage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    const averageProgress = courses.length
      ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
      : 0
    const activeAccess = courses.filter((course) => Boolean(course.lmsUrl)).length
    const totalModules = courses.reduce((sum, course) => sum + course.modules, 0)

    return [
      {
        label: 'Cours',
        value: courses.length,
        helper: 'Parcours exposes dans votre espace numerique.',
        icon: Laptop,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Acces actifs',
        value: activeAccess,
        helper: 'Cours avec lien LMS deja disponible.',
        icon: ShieldCheck,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Progression moyenne',
        value: `${averageProgress}%`,
        helper: 'Avancement global sur les cours affiches.',
        icon: Gauge,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
      {
        label: 'Modules',
        value: totalModules,
        helper: 'Total des modules repertories.',
        icon: Layers3,
        accent: 'from-[#1d4ed8] via-[#1e3a8a] to-[#020617]',
      },
    ]
  }, [courses])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/lms/courses')
      try {
        const data = await response.json()
        setCourses(data)
      } catch {
        setCourses([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Plateforme e-learning"
        description="Chargement de vos cours, de vos acces LMS et de vos indicateurs de progression en ligne."
        icon={Laptop}
      >
        <StudentSectionCard
          eyebrow="E-learning"
          title="Preparation de la plateforme"
          description="Nous recuperons vos parcours numeriques et vos liens d'acces."
          icon={BookOpen}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement de vos cours...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Plateforme e-learning"
      description="Accedez a votre environnement d'apprentissage en ligne, visualisez votre progression et retrouvez les ressources liees a chaque cours."
      icon={Laptop}
      metrics={metrics}
    >
      {courses.length === 0 ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <StudentSectionCard
            eyebrow="Configuration"
            title="Plateforme en cours d'activation"
            description="Votre espace e-learning est en cours de preparation. Les acces seront affiches ici des qu'ils seront finalises."
            icon={ShieldCheck}
          >
            <StudentEmptyState
              title="Acces numerique en attente"
              description="Vous recevrez une notification des que vos cours seront synchronises avec la plateforme e-learning."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href={`/${locale}/espace-etudiants/supports`} className={studentPrimaryButtonClassName}>
                    Voir les supports
                  </Link>
                  <Link href={`/${locale}/espace-etudiants/travaux`} className={studentMutedButtonClassName}>
                    Soumettre un travail
                  </Link>
                </div>
              }
            />
          </StudentSectionCard>

          <StudentSectionCard
            eyebrow="En attendant"
            title="Actions utiles pendant la mise en place"
            description="Vous pouvez continuer a avancer sur votre parcours sans attendre l'activation finale de la plateforme."
            icon={FolderOpen}
          >
            <div className="space-y-3">
              {[
                'Consulter vos supports pedagogiques.',
                'Soumettre vos travaux et projets.',
                'Consulter vos resultats et certificats.',
                'Suivre vos formations depuis le dashboard.',
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {item}
                </div>
              ))}
              <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
                <p className="text-sm font-semibold text-slate-950">Acces directs</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/${locale}/espace-etudiants/supports`} className={studentSurfaceButtonClassName}>
                    Supports
                  </Link>
                  <Link href={`/${locale}/espace-etudiants/resultats`} className={studentSurfaceButtonClassName}>
                    Resultats
                  </Link>
                  <Link href={`/${locale}/espace-etudiants`} className={studentSurfaceButtonClassName}>
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </StudentSectionCard>
        </div>
      ) : (
        <StudentSectionCard
          eyebrow="Cours"
          title="Parcours disponibles"
          description="Suivez votre progression module par module et accedez directement a chaque cours lorsque le lien LMS est disponible."
          icon={BookOpen}
        >
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">{course.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{course.description}</p>
                  </div>
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cj-blue)]">Progression</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{course.progress}%</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Modules completes</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{course.completedModules} / {course.modules}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 xl:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Avancement</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--cj-red)_0%,var(--cj-blue)_100%)]"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                  {course.lmsUrl ? (
                    <a
                      href={course.lmsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={studentPrimaryButtonClassName}
                    >
                      Acceder au cours
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button disabled className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-500">
                      Acces en attente
                    </button>
                  )}
                  <Link href={`/${locale}/espace-etudiants/supports?formationId=${course.id}`} className={studentMutedButtonClassName}>
                    Supports de cours
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </StudentSectionCard>
      )}
    </StudentPageShell>
  )
}
