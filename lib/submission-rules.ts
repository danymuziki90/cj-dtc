type SubmissionState = {
  status?: string | null
  correctionStatus?: string | null
} | null | undefined

type AssignmentWithSubmission = {
  deadline?: string | Date | null
  allowResubmission?: boolean | null
  submissions?: SubmissionState[]
  Submission?: SubmissionState[]
}

function normalizeStatus(status?: string | null) {
  return status?.trim().toLowerCase().replace(/[\s-]+/g, '_') || ''
}

/**
 * A returned submission is the only existing submission a student may replace,
 * and only when the assignment explicitly permits resubmission.
 */
export function isReturnedSubmission(submission: SubmissionState) {
  return normalizeStatus(submission?.status) === 'returned'
    || normalizeStatus(submission?.correctionStatus) === 'returned'
}

export function canStudentResubmit(allowResubmission: boolean | null | undefined, submission: SubmissionState) {
  return Boolean(submission) && allowResubmission !== false && isReturnedSubmission(submission)
}

export function hasStudentSubmission(assignment: AssignmentWithSubmission) {
  return Boolean(assignment.submissions?.[0] ?? assignment.Submission?.[0])
}

export function getStudentSubmission<T extends SubmissionState>(assignment: AssignmentWithSubmission): T | undefined {
  return (assignment.submissions?.[0] ?? assignment.Submission?.[0]) as T | undefined
}

/** Shared client/server rule for the student submission lifecycle. */
export function canStudentSubmitAssignment(assignment: AssignmentWithSubmission) {
  const submission = assignment.submissions?.[0] ?? assignment.Submission?.[0]
  const deadline = assignment.deadline ? new Date(assignment.deadline).getTime() : NaN
  const isPastDeadline = Number.isFinite(deadline) && deadline < Date.now()

  if (isPastDeadline) return false
  if (!submission) return true

  return canStudentResubmit(assignment.allowResubmission, submission)
}

/**
 * Counts are derived from persisted assignment/submission data returned by Prisma.
 * A returned submission is counted as "to submit" only when it can be replaced.
 */
export function getStudentAssignmentSummary(assignments: AssignmentWithSubmission[]) {
  return assignments.reduce(
    (summary, assignment) => {
      if (canStudentSubmitAssignment(assignment)) summary.toSubmit += 1
      if (hasStudentSubmission(assignment)) summary.submitted += 1
      return summary
    },
    { toSubmit: 0, submitted: 0 },
  )
}
