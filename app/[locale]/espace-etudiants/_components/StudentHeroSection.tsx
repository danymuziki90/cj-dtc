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
  heroData,
}: StudentHeroSectionProps) {
  const firstName = student.firstName || "Étudiant";
  const heroImage = heroData?.imageUrl || "/books-wood.jpg";
  
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-[0_18px_45px_-24px_rgba(2,20,47,0.75)] sm:-mx-2">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${heroImage}")`, backgroundPosition: "center 58%" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,47,0.93)_0%,rgba(2,36,86,0.82)_48%,rgba(2,20,47,0.48)_100%)]" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-white/15 bg-white/5" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 translate-y-1/2 rounded-full bg-[var(--cj-blue)]/35 blur-2xl" />
      
      {/* Content */}
      <div className="relative flex min-h-[200px] flex-col justify-end p-5 sm:min-h-[220px] sm:p-7 lg:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Statut : {student.status || "Actif"}
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Bonjour, <span className="text-blue-400">{firstName}</span>
          </h1>
          
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-white/80 sm:text-base">
            Continuez votre parcours de formation. {heroSummary}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
    </section>
  );
}

