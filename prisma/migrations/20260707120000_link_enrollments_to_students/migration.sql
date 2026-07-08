ALTER TABLE "Enrollment" ADD COLUMN "studentId" TEXT;

CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
