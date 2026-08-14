-- Étend le système Hero existant sans modifier les images ou slides déjà publiés.
ALTER TABLE "HeroSection"
  ADD COLUMN "carouselEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "slideDuration" INTEGER NOT NULL DEFAULT 6000;

ALTER TABLE "HeroSlide"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "ctaLabelFr" TEXT,
  ADD COLUMN "ctaLabelEn" TEXT,
  ADD COLUMN "ctaHref" TEXT;
