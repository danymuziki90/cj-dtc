"use client";

import Link from "next/link";
import { LogOut, UserIcon } from "lucide-react";

interface StudentHeaderProps {
  student: any;
  studentInitial: string;
  basePath: string;
  pendingAssignmentsCount?: number;
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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 lg:px-8">
        {/* Left — avatar + nom */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.fullName}
              className="h-9 w-9 shrink-0 rounded-xl border border-white/20 object-cover shadow sm:h-10 sm:w-10"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 font-bold text-white shadow ring-1 ring-white/10 sm:h-10 sm:w-10">
              {studentInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/50 sm:text-[10px]">
              Espace Étudiant
            </p>
            <h1 className="truncate text-xs font-semibold text-white sm:text-sm">
              {student.fullName}
            </h1>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Mon profil — icône seule sur mobile */}
          <Link
            href={`${basePath}/mon-compte`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/10 sm:px-3"
            title="Mon profil"
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mon profil</span>
          </Link>

          {/* Déconnexion */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cj-red)] px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--cj-red-700)] shadow sm:px-3"
            title="Déconnexion"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
