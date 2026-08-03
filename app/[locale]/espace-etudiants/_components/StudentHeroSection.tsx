"use client";

import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  MapPinIcon,
  Phone,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import { formatDate, statusClass } from "./utils";
import UnifiedHero from "@/components/ui/UnifiedHero";

interface StudentHeroSectionProps {
  student: any;
  currentSession: any;
  heroSummary: string;
  heroStats: Array<{
    icon: any;
    label: string;
    value: string;
  }>;
  eligibility: any;
  firstCertificate: any;
  basePath: string;
  heroData?: any;
}

export function StudentHeroSection({
  student,
  currentSession,
  heroSummary,
  heroStats,
  eligibility,
  firstCertificate,
  basePath,
  heroData,
}: StudentHeroSectionProps) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <UnifiedHero
        heroData={heroData}
        image="/img/team.jpeg"
        imageAlt="Espace Étudiant"
        eyebrow="Tableau de bord étudiant"
        title="Pilotage complet de votre parcours"
        description={heroSummary}
        badges={[
          { label: `Statut étudiant : ${student.status}`, color: 'blue' }
        ]}
        compact
      >
        <div className="space-y-8 mt-6">
          <div className="grid gap-2 pt-1 md:grid-cols-3">
            {heroStats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  <Icon className="h-3.5 w-3.5 text-blue-300" />
                  {label}
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`${basePath}/supports`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-white">Supports de cours</span>
            </Link>
            {firstCertificate && firstCertificate.fileUrl && (
              <a
                href={firstCertificate.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/40 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Mon certificat
              </a>
            )}
          </div>

          {/* Certificate Eligibility widget */}
          <div className="space-y-4 max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    Éligibilité au certificat
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {eligibility.eligible
                      ? "Prêt pour la délivrance"
                      : "Critères d'évaluation en cours"}
                  </p>
                </div>
                <ShieldCheck
                  className={`h-7 w-7 ${
                    eligibility.eligible ? "text-emerald-400" : "text-blue-300"
                  }`}
                />
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 border border-white/10">
                  <span className="text-white/90">Projet académique validé</span>
                  {eligibility.projectValidated ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 border border-white/10">
                  <span className="text-white/90">
                    Taux de présence{" "}
                    {eligibility.attendanceRate !== null
                      ? `(${eligibility.attendanceRate}%)`
                      : ""}
                  </span>
                  {eligibility.attendanceValidated ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UnifiedHero>
    </div>
  );
}
