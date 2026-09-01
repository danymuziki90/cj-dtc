CREATE TABLE IF NOT EXISTS "DirectorWelcome" (
  "id" TEXT NOT NULL DEFAULT 'director-welcome', "isActive" BOOLEAN NOT NULL DEFAULT true,
  "imageUrl" TEXT, "name" TEXT, "titleFr" TEXT, "titleEn" TEXT, "messageFr" TEXT, "messageEn" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DirectorWelcome_pkey" PRIMARY KEY ("id")
);
