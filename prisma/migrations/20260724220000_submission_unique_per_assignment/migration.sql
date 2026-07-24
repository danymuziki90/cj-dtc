-- One active submission record per student and assignment.
-- Apply only after resolving any historical duplicate rows, if present.
CREATE UNIQUE INDEX "Submission_assignmentId_studentEmail_key"
ON "Submission"("assignmentId", "studentEmail");
