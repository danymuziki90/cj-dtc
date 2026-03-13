-- Bootstrap non destructif des tables portail admin / etudiant.
-- A executer une seule fois sur une base PostgreSQL qui n'a pas encore ces tables.

CREATE TABLE IF NOT EXISTS "AdminTrainingSession" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminTrainingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Student" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "studentNumber" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "adminSessionId" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "address" TEXT,
  "city" TEXT,
  "country" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Student_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Student_adminSessionId_fkey" FOREIGN KEY ("adminSessionId") REFERENCES "AdminTrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Student_email_key" ON "Student"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_username_key" ON "Student"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "Student_studentNumber_key" ON "Student"("studentNumber");
CREATE INDEX IF NOT EXISTS "Student_username_idx" ON "Student"("username");
CREATE INDEX IF NOT EXISTS "Student_adminSessionId_idx" ON "Student"("adminSessionId");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PasswordResetToken_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_studentId_idx" ON "PasswordResetToken"("studentId");

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

CREATE TABLE IF NOT EXISTS "StudentSubmission" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "sessionId" TEXT,
  "title" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudentSubmission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdminTrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "StudentSubmission_studentId_idx" ON "StudentSubmission"("studentId");
CREATE INDEX IF NOT EXISTS "StudentSubmission_sessionId_idx" ON "StudentSubmission"("sessionId");
CREATE INDEX IF NOT EXISTS "StudentSubmission_status_idx" ON "StudentSubmission"("status");

CREATE TABLE IF NOT EXISTS "StudentCertificate" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Certificate',
  "fileUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentCertificate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StudentCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "StudentCertificate_studentId_idx" ON "StudentCertificate"("studentId");
