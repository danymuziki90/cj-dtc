"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPinIcon,
  MonitorSmartphone,
} from "lucide-react";
import { FormattedDate } from "@/components/FormattedDate";
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentStatusClass,
  type StudentMetric,
} from "@/components/ui/student-space";

interface Enrollment {
  id: number;
  status: string;
  startDate: string;
  formation: {
    id: number;
    title: string;
    slug: string;
    description: string;
  };
  session: {
    id: number;
    startDate: string;
    endDate: string;
    location: string;
    format: string;
  } | null;
}


function enrollmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "En attente",
    accepted: "Accepte",
    confirmed: "Confirme",
    rejected: "Rejete",
    cancelled: "Annule",
    completed: "Termine",
  };
  return labels[status] || status;
}

export default function MesFormationsPage() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const metrics = useMemo<StudentMetric[]>(() => {
    const completedCount = enrollments.filter(
      (item) => item.status === "completed",
    ).length;
    const activeSessions = enrollments.filter((item) => item.session).length;

    return [
      {
        label: "Formations",
        value: enrollments.length,
        helper: "Parcours actuellement visibles dans votre compte.",
        icon: GraduationCap,
        accent: "from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]",
      },
      {
        label: "Sessions liees",
        value: activeSessions,
        helper: "Inscriptions rattachees a une session planifiee.",
        icon: CalendarDays,
        accent: "from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]",
      },
      {
        label: "Formations terminees",
        value: completedCount,
        helper: "Programmes deja finalises ou certificables.",
        icon: BadgeCheck,
        accent: "from-[#1d4ed8] via-[#1e3a8a] to-[#020617]",
      },
    ];
  }, [enrollments]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/system/dashboard");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des formations");
      }
      const data = await response.json();
      setEnrollments(data.dashboard?.enrollments || []);
    } catch (error) {
      console.error("Erreur lors du chargement des formations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Mes formations"
        description="Chargement de vos inscriptions, de vos sessions et de vos informations de paiement."
        icon={GraduationCap}
      >
        <StudentSectionCard
          eyebrow="Parcours"
          title="Preparation des formations"
          description="Nous recuperons vos inscriptions, vos sessions liees et vos statuts de progression."
          icon={BookOpen}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement de vos formations...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Mes formations"
      description="Consultez vos inscriptions, suivez l'avancement de vos paiements et retrouvez les liens utiles vers vos sessions et vos supports."
      icon={GraduationCap}
      metrics={metrics}
      actions={
        <Link
          href={`/${locale}/formations#sessions`}
          className={studentPrimaryButtonClassName}
        >
          Explorer les sessions
        </Link>
      }
    >
      <StudentSectionCard
        eyebrow="Parcours"
        title="Vue d'ensemble de vos formations"
        description="Chaque carte rassemble le statut d'inscription, l'etat du paiement, le calendrier et les acces utiles pour continuer votre progression."
        icon={BookOpen}
      >
        {enrollments.length === 0 ? (
          <StudentEmptyState
            title="Aucune formation active"
            description="Vous n'etes inscrit a aucune formation pour le moment. Parcourez les sessions disponibles pour demarrer un nouveau parcours."
            action={
              <Link
                href={`/${locale}/formations#sessions`}
                className={studentPrimaryButtonClassName}
              >
                Decouvrir les sessions
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              return (
                <div
                  key={enrollment.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(0,45,114,0.35)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                        {enrollment.formation.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {enrollment.formation.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${studentStatusClass(enrollment.status)}`}
                      >
                        {enrollmentStatusLabel(enrollment.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <CalendarDays className="h-4 w-4 text-[var(--cj-blue)]" />
                        Debut de parcours
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        <FormattedDate date={enrollment.startDate} />
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <MonitorSmartphone className="h-4 w-4 text-[var(--cj-blue)]" />
                        Session / format
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session
                          ? `${enrollment.session.format || "Format non renseigne"}`
                          : "Session non encore planifiee"}
                      </p>
                      {enrollment.session ? (
                        <p className="mt-1 text-xs text-slate-500">
                          <FormattedDate date={enrollment.session.startDate} />{" "}
                          - <FormattedDate date={enrollment.session.endDate} />
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <MapPinIcon className="h-4 w-4 text-[var(--cj-blue)]" />
                        Lieu
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session?.location || "A preciser"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    <Link
                      href={`/${locale}/formations/${enrollment.formation.slug}`}
                      className={studentMutedButtonClassName}
                    >
                      Voir les details
                    </Link>
                    <Link
                      href={`/${locale}/espace-etudiants/supports?formationId=${enrollment.formation.id}`}
                      className={studentMutedButtonClassName}
                    >
                      Supports de cours
                    </Link>
                    {enrollment.status === "completed" ? (
                      <Link
                        href={`/${locale}/espace-etudiants/resultats`}
                        className={studentPrimaryButtonClassName}
                      >
                        Voir les resultats
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </StudentSectionCard>
    </StudentPageShell>
  );
}
