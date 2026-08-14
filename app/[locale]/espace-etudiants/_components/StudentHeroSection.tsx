"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download } from "lucide-react";

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
  const publishedSlides = (heroData?.slides || []).filter(
    (slide: any) => slide.isActive !== false && slide.imageUrl
  );
  const fallbackSlide = {
    id: "student-space-default",
    imageUrl: heroData?.imageUrl || "/books-wood.jpg",
  };
  const slides = publishedSlides.length > 0 ? publishedSlides : [fallbackSlide];
  const isCarousel = heroData?.carouselEnabled !== false && slides.length > 1;
  const slideDuration = Math.min(30000, Math.max(2000, Number(heroData?.slideDuration) || 6000));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((index + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    setCurrentSlide((current) => Math.min(current, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (!isCarousel || isPaused) return;
    const timer = window.setInterval(() => goToSlide(currentSlide + 1), slideDuration);
    return () => window.clearInterval(timer);
  }, [currentSlide, goToSlide, isCarousel, isPaused, slideDuration]);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-[0_18px_45px_-24px_rgba(2,20,47,0.75)] sm:rounded-3xl">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide: any, index: number) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url("${slide.imageUrl}")`, backgroundPosition: "center 58%" }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,47,0.93)_0%,rgba(2,36,86,0.82)_48%,rgba(2,20,47,0.48)_100%)]" />
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border border-white/15 bg-white/5" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 translate-y-1/2 rounded-full bg-[var(--cj-blue)]/35 blur-2xl" />

      {/* Content */}
      <div
        className="relative flex min-h-[140px] flex-col justify-end p-4 sm:min-h-[200px] sm:p-7 lg:min-h-[220px] lg:p-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-3xl space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Statut : {student.status || "Actif"}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Bonjour, <span className="text-blue-400">{firstName}</span>
          </h1>

          <p className="max-w-2xl text-xs font-medium leading-relaxed text-white/80 sm:text-sm">
            Continuez votre parcours de formation. {heroSummary}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5 sm:pt-1">
            <Link
              href={`${basePath}/supports`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:shadow-lg sm:px-5 sm:py-2.5"
            >
              <BookOpen className="h-4 w-4" />
              Supports de cours
            </Link>

            {firstCertificate && firstCertificate.fileUrl && (
              <a
                href={firstCertificate.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-sm transition-all hover:bg-emerald-500/40 hover:shadow-lg sm:px-5 sm:py-2.5"
              >
                <Download className="h-4 w-4" />
                Mon certificat
              </a>
            )}
          </div>
        </div>
      </div>

      {isCarousel && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 sm:bottom-5 sm:right-5">
          <button
            type="button"
            onClick={() => goToSlide(currentSlide - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:h-9 sm:w-9"
            aria-label="Image précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/35 px-2.5 py-2 backdrop-blur-sm">
            {slides.map((slide: any, index: number) => (
              <button
                key={`indicator-${slide.id}`}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                  index === currentSlide ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Afficher l'image ${index + 1}`}
                aria-current={index === currentSlide ? "true" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goToSlide(currentSlide + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-slate-950/35 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:h-9 sm:w-9"
            aria-label="Image suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
