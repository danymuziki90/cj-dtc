-- Add column Student.role if the table exists but the column was missing (e.g. DB created before role was in schema).
-- The Role enum may already exist from the User table.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');
  END IF;
END
$$;

ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "role" "Role" NOT NULL DEFAULT 'STUDENT';
