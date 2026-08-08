type CertificateOwner = {
  studentId: string | null
  enrollment?: {
    studentId: string | null
    email: string
  } | null
}

type AuthenticatedStudent = { id: string; email: string }

/** Checks the ownership of private certificate downloads. */
export function studentOwnsCertificate(
  certificate: CertificateOwner,
  student: AuthenticatedStudent,
): boolean {
  if (certificate.studentId === student.id) return true
  if (certificate.enrollment?.studentId === student.id) return true

  return (
    certificate.enrollment?.studentId == null &&
    certificate.enrollment?.email.trim().toLowerCase() === student.email.trim().toLowerCase()
  )
}
