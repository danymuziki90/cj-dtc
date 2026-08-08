"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  GraduationCap,
  Newspaper,
} from "lucide-react";

interface StudentStatsCardsProps {
  totalFormationsCount: number;
  activeSessionsCount: number;
  pendingAssignmentsCount: number;
  submittedAssignmentsCount: number;
  newsCount: number;
  locale?: string;
}

export function StudentStatsCards({
  totalFormationsCount,
  activeSessionsCount,
  pendingAssignmentsCount,
  submittedAssignmentsCount,
  newsCount,
  locale = "fr",
}: StudentStatsCardsProps) {
  const prefix = locale ? `/${locale}` : "";

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* Card 1: Sessions (Bleu) */}
      <Link
        href={`${prefix}/espace-etudiants/mes-formations`}
        className="group relative overflow-hidden rounded-[26px] border border-blue-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-[var(--cj-blue)]" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sessions</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-blue-100">
            <GraduationCap className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{totalFormationsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Inscriptions enregistrées</p>
      </Link>

      {/* Card 2: En cours (Orange) */}
      <Link
        href={`${prefix}/espace-etudiants/mes-formations`}
        className="group relative overflow-hidden rounded-[26px] border border-orange-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">En cours</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-orange-100">
            <Activity className="h-4 w-4 animate-pulse" />
          </div>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{activeSessionsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Sessions actives</p>
      </Link>


      {/* Card 3: À remettre (Rouge) */}
      <div
        className="group relative overflow-hidden rounded-[26px] border border-red-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-200 hover:bg-red-50/30"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-[var(--cj-red)]" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">À remettre</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-red-100">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{pendingAssignmentsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Devoirs en attente de dépôt</p>
      </div>

      {/* Card 4: Rendus (Vert) */}
      <div
        className="group relative overflow-hidden rounded-[26px] border border-emerald-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200 hover:bg-emerald-50/30"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rendus</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{submittedAssignmentsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Travaux transmis</p>
      </div>

      {/* Card 5: Actualités (Violet/Indigo) */}
      <div className="group relative overflow-hidden rounded-[26px] border border-indigo-100 bg-white/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 hover:bg-indigo-50/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Actualités</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-indigo-100">
            <Newspaper className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{newsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1 font-medium">Annonces récentes</p>
      </div>
    </section>
  );
}
