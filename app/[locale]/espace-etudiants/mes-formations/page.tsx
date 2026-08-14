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
} from "@/components/ui/student-space";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('student');

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);



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
        eyebrow={locale === 'fr' ? "Espace étudiant" : "Student Space"}
        title={t('my_formations')}
        description={locale === 'fr' ? "Chargement de vos inscriptions, de vos sessions et de vos informations de paiement." : "Loading your enrollments, sessions and payment info."}
        icon={GraduationCap}
      >
        <StudentSectionCard
          eyebrow={locale === 'fr' ? "Parcours" : "Pathways"}
          title={locale === 'fr' ? "Préparation des formations" : "Preparing your programs"}
          description={locale === 'fr' ? "Nous récupérons vos inscriptions, vos sessions liées et vos statuts de progression." : "We are retrieving your enrollments, linked sessions and progress."}
          icon={BookOpen}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {locale === 'fr' ? "Chargement de vos formations..." : "Loading your programs..."}
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    );
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow={locale === 'fr' ? "Espace étudiant" : "Student Space"}
      title={t('my_formations')}
      description={locale === 'fr' ? "Consultez vos inscriptions, suivez l'avancement de vos paiements et retrouvez les liens utiles vers vos sessions et vos supports." : "View your enrollments, track payments and find useful links to your sessions and materials."}
      icon={GraduationCap}
      actions={
        <Link
          href={`/${locale}/formations#sessions`}
          className={studentPrimaryButtonClassName}
        >
          {locale === 'fr' ? "Explorer les sessions" : "Explore sessions"}
        </Link>
      }
    >
      <StudentSectionCard
        eyebrow={locale === 'fr' ? "Parcours" : "Pathways"}
        title={locale === 'fr' ? "Vue d'ensemble de vos formations" : "Overview of your programs"}
        description={locale === 'fr' ? "Chaque carte rassemble le statut d'inscription, l'état du paiement, le calendrier et les accès utiles pour continuer votre progression." : "Each card gathers enrollment status, payment state, calendar and useful accesses."}
        icon={BookOpen}
      >
        {enrollments.length === 0 ? (
          <StudentEmptyState
            title={locale === 'fr' ? "Aucune formation active" : "No active programs"}
            description={locale === 'fr' ? "Vous n'êtes inscrit à aucune formation pour le moment. Parcourez les sessions disponibles pour démarrer un nouveau parcours." : "You are not enrolled in any program yet. Browse available sessions to start a new pathway."}
            action={
              <Link
                href={`/${locale}/formations#sessions`}
                className={studentPrimaryButtonClassName}
              >
                {locale === 'fr' ? "Découvrir les sessions" : "Discover sessions"}
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
                        {locale === 'fr' ? enrollment.formation.title : ((enrollment.formation as any).titleEn || enrollment.formation.title)}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {locale === 'fr' ? enrollment.formation.description : ((enrollment.formation as any).descriptionEn || enrollment.formation.description)}
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
                        {locale === 'fr' ? "Début de parcours" : "Start Date"}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        <FormattedDate date={enrollment.startDate} />
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <MonitorSmartphone className="h-4 w-4 text-[var(--cj-blue)]" />
                        {locale === 'fr' ? "Session / format" : "Session / Format"}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session
                          ? (locale === 'fr' ? enrollment.session.format : ((enrollment.session as any).formatEn || enrollment.session.format)) || (locale === 'fr' ? "Format non renseigné" : "Format not provided")
                          : (locale === 'fr' ? "Session non encore planifiée" : "Session not scheduled yet")}
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
                        {locale === 'fr' ? "Lieu" : "Location"}
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {enrollment.session?.location 
                          ? (locale === 'fr' ? enrollment.session.location : ((enrollment.session as any).locationEn || enrollment.session.location))
                          : (locale === 'fr' ? "À préciser" : "TBD")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
                    <Link
                      href={`/${locale}/formations/${enrollment.formation.slug}`}
                      className={studentMutedButtonClassName}
                    >
                      {locale === 'fr' ? "Voir les détails" : "View Details"}
                    </Link>
                    <Link
                      href={`/${locale}/espace-etudiants/supports?formationId=${enrollment.formation.id}`}
                      className={studentMutedButtonClassName}
                    >
                      {locale === 'fr' ? "Supports de cours" : "Materials"}
                    </Link>
                    {enrollment.status === "completed" ? (
                      <Link
                        href={`/${locale}/espace-etudiants/resultats`}
                        className={studentPrimaryButtonClassName}
                      >
                        {locale === 'fr' ? "Voir les résultats" : "View Results"}
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
