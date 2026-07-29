'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
}: PageHeroProps) {
  return (
    <section
      className={`hero-bg-unified relative overflow-hidden flex flex-col justify-center ${
        compact ? 'min-h-[40vh] pt-24 pb-12' : 'min-h-[60vh] pt-32 pb-20'
      } ${image ? 'has-bg-image' : ''}`}
    >
      {/* Background Image if provided */}
      {image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt="Hero Background"
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
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-sm shadow-sm">
              {eyebrow}
            </div>
          )}

          <h1 className="hero-title-unified drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <h2 className="text-xl sm:text-2xl font-bold text-white/90 drop-shadow-sm">
              {subtitle}
            </h2>
          )}

          {description && (
            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-white/80 font-opensans drop-shadow-sm">
              {description}
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
