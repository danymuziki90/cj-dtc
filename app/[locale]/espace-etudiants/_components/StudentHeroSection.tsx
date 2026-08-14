"use client";

import Link from "next/link";
import { BookOpen, Download } from "lucide-react";

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
  heroSummary,
  firstCertificate,
  basePath,
}: StudentHeroSectionProps) {
  const firstName = student.firstName || "Étudiant";
  
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl sm:-mx-2">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url("/img/team.jpeg")' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/40" />
      
      {/* Content */}
      <div className="relative flex min-h-[220px] flex-col justify-end p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Statut : {student.status || "Actif"}
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Bonjour, <span className="text-blue-400">{firstName}</span>
          </h1>
          
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-white/80 sm:text-base">
            Continuez votre parcours de formation. {heroSummary}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`${basePath}/supports`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:shadow-lg"
            >
              <BookOpen className="h-4 w-4" />
              Supports de cours
            </Link>
            
            {firstCertificate && firstCertificate.fileUrl && (
              <a
                href={firstCertificate.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-100 backdrop-blur-sm transition-all hover:bg-emerald-500/40 hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                Mon certificat
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

