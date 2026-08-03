'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { HeroSectionData } from '@/lib/hero/types';

interface PageHeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  eyebrow?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  compact?: boolean;
  children?: React.ReactNode;
  /**
   * Données dynamiques depuis la DB (optionnel).
   * Quand fourni, écrase image, eyebrow, title et description.
   */
  heroData?: HeroSectionData | null;
  /** Locale courante pour choisir FR ou EN */
  locale?: string;
}

export function PageHero({
  title,
  subtitle,
  description,
  image,
  eyebrow,
  primaryCta,
  secondaryCta,
  compact = false,
  children,
  heroData,
  locale = 'fr',
}: PageHeroProps) {
  const isFr = locale !== 'en';

  // Résoudre les valeurs effectives (DB > props statiques)
  const effectiveImage    = heroData?.imageUrl ?? heroData?.defaultImageUrl ?? image;
  const effectiveEyebrow  = heroData
    ? (isFr ? heroData.eyebrowFr : heroData.eyebrowEn) ?? eyebrow
    : eyebrow;
  const effectiveTitle    = heroData
    ? (isFr ? heroData.titleFr : heroData.titleEn) || title
    : title;
  const effectiveDesc     = heroData
    ? (isFr ? heroData.descriptionFr : heroData.descriptionEn) ?? description
    : description;
  const effectiveCompact  = heroData?.compact ?? compact;

  return (
    <section
      className={`hero-bg-unified relative overflow-hidden flex flex-col justify-center ${
        effectiveCompact ? 'min-h-[40vh] pt-24 pb-12' : 'min-h-[60vh] pt-32 pb-20'
      } ${effectiveImage ? 'has-bg-image' : ''}`}
    >
      {/* Background Image if provided */}
      {effectiveImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={effectiveImage}
            alt={heroData?.imageAlt ?? 'Hero Background'}
            fill
            priority
            className="object-cover animate-kenburns opacity-60"
            sizes="100vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          {effectiveEyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm shadow-sm">
              {effectiveEyebrow}
            </div>
          )}

          <h1 className="hero-title-unified drop-shadow-md">
            {effectiveTitle}
          </h1>

          {subtitle && (
            <h2 className="text-xl sm:text-2xl font-bold text-white/90 drop-shadow-sm">
              {subtitle}
            </h2>
          )}

          {effectiveDesc && (
            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-white/80 font-opensans drop-shadow-sm">
              {effectiveDesc}
            </p>
          )}

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col gap-4 sm:flex-row pt-6">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="btn-primary inline-flex items-center justify-center gap-2 group"
                >
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="btn-secondary inline-flex items-center justify-center bg-white/10 border border-white/30 hover:bg-white/20 backdrop-blur-md text-white"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
          
          {children && (
            <div className="mt-8 pt-8 border-t border-white/10">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
