"use client";

import Link from "next/link";
import { FileText, LogOut, UserIcon } from "lucide-react";

interface StudentHeaderProps {
  student: any;
  studentInitial: string;
  basePath: string;
  onLogout: () => void;
}

export function StudentHeader({
  student,
  studentInitial,
  basePath,
  onLogout,
}: StudentHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.fullName}
              className="h-10 w-10 rounded-xl border border-white/20 object-cover shadow"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-bold text-white shadow ring-1 ring-white/10">
              {studentInitial}
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
              Espace Étudiant | LMS
            </p>
            <h1 className="text-sm font-semibold text-white">
              {student.fullName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${basePath}/travaux`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
          >
            <FileText className="h-3.5 w-3.5" />
            Mes Travaux
          </Link>

          <Link
            href={`${basePath}/mon-compte`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition"
          >
            <UserIcon className="h-3.5 w-3.5" />
            Mon compte
          </Link>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-red)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--cj-red-700)] shadow"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
