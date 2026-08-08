"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";

interface HomeSlide {
  id: string;
  imageUrl: string;
  eyebrowFr?: string;
  eyebrowEn?: string;
  titleFr: string;
  titleEn: string;
  descriptionFr?: string;
  descriptionEn?: string;
  badgeFr?: string;
  badgeEn?: string;
}

const DEFAULT_HOME_SLIDES: HomeSlide[] = [
  {
    id: "1",
    imageUrl: "/lor-de-formation.jpeg",
    eyebrowFr: "Centre de Formation Panafricain",
    eyebrowEn: "Pan-African Training Center",
    titleFr: "Développez vos compétences. Construisez votre avenir.",
    titleEn: "Build your skills. Shape your future.",
    descriptionFr:
      "Des formations pratiques et professionnalisantes conçues pour développer des compétences concrètes, obtenir des certifications et progresser dans votre carrière.",
    descriptionEn:
      "Practical, career-focused training designed to build concrete skills, earn certifications, and advance your career.",
    badgeFr: "Excellence Panafricaine",
    badgeEn: "Pan-African Excellence",
  },
  {
    id: "2",
    imageUrl: "/img/certificat 1.jpeg",
    eyebrowFr: "Solutions Pour Entreprises",
    eyebrowEn: "Enterprise Solutions",
    titleFr: "Formations Professionnelles pour les Entreprises",
    titleEn: "Corporate Professional Training",
    descriptionFr:
      "Renforcez les compétences de vos collaborateurs grâce à des formations professionnelles sur mesure, conçues pour améliorer la performance, le leadership et la productivité de votre organisation.",
    descriptionEn:
      "Empower your teams with customized professional training designed to enhance performance, leadership, and productivity.",
    badgeFr: "Sur Mesure & In-Company",
    badgeEn: "Customized & In-Company",
  },
  {
    id: "3",
    imageUrl: "/apropos.jpeg",
    eyebrowFr: "Accompagnement & Carrière",
    eyebrowEn: "Career Guidance & Support",
    titleFr: "Orientation et Insertion Professionnelle",
    titleEn: "Career Guidance & Professional Insertion",
    descriptionFr:
      "Préparez votre avenir professionnel avec confiance. Nous vous accompagnons dans votre orientation, la construction de votre projet de carrière et votre insertion sur le marché de l'emploi.",
    descriptionEn:
      "Prepare your professional future with confidence. We guide your orientation, career project building, and employment market insertion.",
    badgeFr: "Parcours IOP Certifié",
    badgeEn: "Certified IOP Program",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

const slideAnim = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.8 } },
};

export default function HomeHero({
  heroData,
  locale = "fr",
}: {
  heroData?: any;
  locale?: string;
}) {
  const isFr = locale !== "en";
  const shouldReduceMotion = useReducedMotion();
  const slides = heroData?.slides?.length ? heroData.slides : DEFAULT_HOME_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, shouldReduceMotion]);

  if (!slides.length) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const eyebrow = isFr ? currentSlide.eyebrowFr : currentSlide.eyebrowEn;
  const title = isFr ? currentSlide.titleFr : currentSlide.titleEn;
  const description = isFr ? currentSlide.descriptionFr : currentSlide.descriptionEn;
  const badge = isFr ? currentSlide.badgeFr : currentSlide.badgeEn;

  return (
    <section
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-24 lg:min-h-[90vh] lg:pt-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Slides with Ken Burns Effect ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            variants={slideAnim}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0"
          >
            {currentSlide.imageUrl && (
              <Image
                src={currentSlide.imageUrl}
                alt={title || "CJ DTC"}
                fill
                priority={currentIndex === 0}
                className={`object-cover object-center ${
                  !shouldReduceMotion
                    ? "animate-[ken-burns_15s_ease-out_forwards]"
                    : ""
                }`}
                sizes="100vw"
                quality={90}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Premium Vignette & Gradients */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 mix-blend-multiply" />
        {/* Subtle geometric overlay */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_20%_50%,rgba(0,102,255,0.15)_0%,transparent_50%)]" />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-30 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid max-w-3xl gap-8"
          >
            {/* Glassmorphic Content Card */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
              {/* Eyebrow & Badge */}
              <div className="mb-6 flex flex-wrap items-center gap-4">
                {badge && (
                  <motion.div
                    custom={0}
                    variants={fadeUp}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cj-red)]/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(200,16,46,0.5)]"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {badge}
                  </motion.div>
                )}
                {eyebrow && (
                  <motion.span
                    custom={0.1}
                    variants={fadeUp}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200"
                  >
                    {eyebrow}
                  </motion.span>
                )}
              </div>

              {/* Title */}
              <motion.h1
                custom={0.2}
                variants={fadeUp}
                className="mb-6 text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                {title?.split(".").map((part, i, arr) => (
                  <span key={i}>
                    {i === arr.length - 2 ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm">
                        {part}.
                      </span>
                    ) : (
                      part + (i < arr.length - 1 ? "." : "")
                    )}
                  </span>
                ))}
              </motion.h1>

              <motion.div
                custom={0.3}
                variants={fadeUp}
                className="mb-6 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--cj-red)] to-red-500"
              />

              {/* Description */}
              {description && (
                <motion.p
                  custom={0.4}
                  variants={fadeUp}
                  className="mb-10 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
                >
                  {description}
                </motion.p>
              )}

              {/* CTAs */}
              <motion.div
                custom={0.5}
                variants={fadeUp}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href={`/${locale}/formations`}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--cj-blue)] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/50 transition-all hover:scale-105 hover:shadow-blue-900/70"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isFr ? "Découvrir nos formations" : "Explore our programs"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-[var(--cj-blue)] to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>

                <Link
                  href={`/${locale}/sessions`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40"
                >
                  {isFr ? "Voir les prochaines sessions" : "View upcoming sessions"}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide Navigation (Bottom) ── */}
      <div className="absolute bottom-8 left-0 right-0 z-40 hidden w-full px-8 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 focus:outline-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 focus:outline-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/40 px-6 py-3 backdrop-blur-md">
            {slides.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ${
                  index === currentIndex ? "w-16 bg-white/20" : "w-3 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <div className="absolute inset-0 animate-[hero-progress_7s_linear] bg-gradient-to-r from-[var(--cj-blue)] to-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Required CSS Animations (Ken Burns & Progress) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes hero-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </section>
  );
}
