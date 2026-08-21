-- Étend le système Hero existant sans modifier les images ou slides déjà publiés.
ALTER TABLE "HeroSection"
  ADD COLUMN IF NOT EXISTS "carouselEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "slideDuration" INTEGER NOT NULL DEFAULT 6000;

ALTER TABLE "HeroSlide"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "ctaLabelFr" TEXT,
  ADD COLUMN IF NOT EXISTS "ctaLabelEn" TEXT,
  ADD COLUMN IF NOT EXISTS "ctaHref" TEXT;
