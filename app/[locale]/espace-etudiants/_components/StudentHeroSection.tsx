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
}

export function StudentHeroSection({
  student,
  currentSession,
  heroSummary,
  heroStats,
  eligibility,
  firstCertificate,
  basePath,
}: StudentHeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white shadow-2xl border border-white/10 sm:p-6">
      <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-[rgba(227,6,19,0.15)] blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            <Sparkle className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
            Tableau de bord étudiant
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl text-white">
            Pilotage complet de votre parcours
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Statut étudiant :</span>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${statusClass(
                student.status
              )}`}
            >
              {student.status}
            </span>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-white">
            {heroSummary}
          </p>

          <div className="grid gap-2 pt-1 md:grid-cols-3">
            {heroStats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  <Icon className="h-3.5 w-3.5 text-blue-400" />
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-white">Supports de cours</span>
            </Link>
            {firstCertificate && firstCertificate.fileUrl && (
              <a
                href={firstCertificate.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/25 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Mon certificat
              </a>
            )}
          </div>
        </div>

        {/* Certificate Eligibility widget */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
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
                  eligibility.eligible ? "text-emerald-400" : "text-blue-400"
                }`}
              />
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-950/20 px-3 py-2 border border-white/5">
                <span className="text-white/80">Projet académique validé</span>
                {eligibility.projectValidated ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950/20 px-3 py-2 border border-white/5">
                <span className="text-white/80">
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
    </section>
  );
}
