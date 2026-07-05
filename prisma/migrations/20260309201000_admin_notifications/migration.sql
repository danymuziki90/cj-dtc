CREATE TABLE IF NOT EXISTS "AdminNotification" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "target" TEXT NOT NULL DEFAULT 'all',
  "studentEmail" TEXT,
  "sessionId" INTEGER,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AdminNotification_type_idx" ON "AdminNotification"("type");
CREATE INDEX IF NOT EXISTS "AdminNotification_target_idx" ON "AdminNotification"("target");
CREATE INDEX IF NOT EXISTS "AdminNotification_studentEmail_idx" ON "AdminNotification"("studentEmail");
CREATE INDEX IF NOT EXISTS "AdminNotification_sessionId_idx" ON "AdminNotification"("sessionId");
CREATE INDEX IF NOT EXISTS "AdminNotification_createdAt_idx" ON "AdminNotification"("createdAt");
