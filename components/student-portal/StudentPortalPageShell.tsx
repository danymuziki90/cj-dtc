import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  type StudentMetric,
} from '@/components/ui/student-space'
import StudentPortalNav from '@/components/student-portal/StudentPortalNav'

export function StudentPortalPageShell({
  title,
  description,
  icon,
  metrics,
  actions,
  children,
}: {
  title: string
  description: string
  icon: LucideIcon
  metrics?: StudentMetric[]
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <StudentPageShell
      locale="fr"
      eyebrow="Espace etudiant"
      title={title}
      description={description}
      icon={icon}
      metrics={metrics}
      actions={actions}
      backHref="/student/dashboard"
      backLabel="Retour au dashboard"
    >
      <StudentPortalNav />
      {children}
    </StudentPageShell>
  )
}

export function StudentPortalLoading({ title, description, icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <StudentPortalPageShell title={title} description={description} icon={icon}>
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_24px_70px_-32px_rgba(0,45,114,0.35)]">
        <p className="text-sm font-semibold text-slate-900">Chargement de vos donnees...</p>
        <p className="mt-2 text-sm text-slate-500">Nous preparons votre espace.</p>
      </div>
    </StudentPortalPageShell>
  )
}

export function StudentPortalError({ title, description, icon, error }: { title: string; description: string; icon: LucideIcon; error: string }) {
  return (
    <StudentPortalPageShell title={title} description={description} icon={icon}>
      <StudentEmptyState
        title="Impossible de charger cette page"
        description={error || 'Une erreur est survenue pendant le chargement de vos donnees.'}
      />
    </StudentPortalPageShell>
  )
}
