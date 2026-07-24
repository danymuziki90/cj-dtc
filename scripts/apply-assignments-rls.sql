-- ==========================================================
-- POLITIQUES ROW LEVEL SECURITY (RLS) SUPABASE - MODULE TRAVAUX
-- ==========================================================

-- 1. Activer RLS sur les tables du module Travaux
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssignmentFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubmissionFile" ENABLE ROW LEVEL SECURITY;

-- 2. Suppression des anciennes politiques si existantes
DROP POLICY IF EXISTS "Admins have full access to assignments" ON "Assignment";
DROP POLICY IF EXISTS "Students can view published assignments for their enrolled sessions" ON "Assignment";

DROP POLICY IF EXISTS "Admins have full access to assignment files" ON "AssignmentFile";
DROP POLICY IF EXISTS "Students can view assignment files for published assignments" ON "AssignmentFile";

DROP POLICY IF EXISTS "Admins have full access to submissions" ON "Submission";
DROP POLICY IF EXISTS "Students can view their own submissions" ON "Submission";
DROP POLICY IF EXISTS "Students can insert their own submissions" ON "Submission";
DROP POLICY IF EXISTS "Students can update their own submissions" ON "Submission";

DROP POLICY IF EXISTS "Admins have full access to submission files" ON "SubmissionFile";
DROP POLICY IF EXISTS "Students can view files of their own submissions" ON "SubmissionFile";

-- 3. Politiques RLS pour Assignment
-- Accès complet aux administrateurs
CREATE POLICY "Admins have full access to assignments"
ON "Assignment"
FOR ALL
USING (auth.jwt() ->> 'role' = 'ADMIN' OR current_user = 'postgres');

-- Lecture uniquement pour les étudiants inscrits et acceptés à la session du travail
CREATE POLICY "Students can view published assignments for their enrolled sessions"
ON "Assignment"
FOR SELECT
USING (
  "published" = true
  AND (
    "sessionId" IS NULL OR "sessionId" IN (
      SELECT "sessionId" FROM "Enrollment"
      WHERE ("studentId" = auth.uid()::text OR "email" = auth.jwt() ->> 'email')
      AND "status" IN ('accepted', 'confirmed', 'completed', 'ACCEPTED', 'CONFIRMED', 'COMPLETED', 'ACTIVE', 'active')
    )
  )
);

-- 4. Politiques RLS pour AssignmentFile
CREATE POLICY "Admins have full access to assignment files"
ON "AssignmentFile"
FOR ALL
USING (auth.jwt() ->> 'role' = 'ADMIN' OR current_user = 'postgres');

CREATE POLICY "Students can view assignment files for published assignments"
ON "AssignmentFile"
FOR SELECT
USING (
  "assignmentId" IN (
    SELECT id FROM "Assignment" WHERE "published" = true
  )
);

-- 5. Politiques RLS pour Submission
CREATE POLICY "Admins have full access to submissions"
ON "Submission"
FOR ALL
USING (auth.jwt() ->> 'role' = 'ADMIN' OR current_user = 'postgres');

CREATE POLICY "Students can view their own submissions"
ON "Submission"
FOR SELECT
USING (
  "studentId" = auth.uid()::text
  OR "studentId" IN (
    SELECT id FROM "Student" WHERE "email" = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Students can insert their own submissions"
ON "Submission"
FOR INSERT
WITH CHECK (
  "studentId" = auth.uid()::text
  OR "studentId" IN (
    SELECT id FROM "Student" WHERE "email" = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Students can update their own submissions"
ON "Submission"
FOR UPDATE
USING (
  "studentId" = auth.uid()::text
  OR "studentId" IN (
    SELECT id FROM "Student" WHERE "email" = auth.jwt() ->> 'email'
  )
);

-- 6. Politiques RLS pour SubmissionFile
CREATE POLICY "Admins have full access to submission files"
ON "SubmissionFile"
FOR ALL
USING (auth.jwt() ->> 'role' = 'ADMIN' OR current_user = 'postgres');

CREATE POLICY "Students can view files of their own submissions"
ON "SubmissionFile"
FOR SELECT
USING (
  "submissionId" IN (
    SELECT id FROM "Submission"
    WHERE "studentId" = auth.uid()::text
    OR "studentId" IN (
      SELECT id FROM "Student" WHERE "email" = auth.jwt() ->> 'email'
    )
  )
);
