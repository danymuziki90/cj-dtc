import { redirect } from 'next/navigation'

/**
 * Redirect non-localized /admin/submissions to the canonical
 * localized route /fr/admin/submissions.
 * The real implementation lives in app/[locale]/admin/submissions/page.tsx.
 */
export default function AdminSubmissionsRedirect() {
  redirect('/fr/admin/submissions')
}
