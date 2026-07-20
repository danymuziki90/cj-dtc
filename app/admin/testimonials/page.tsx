import { redirect } from 'next/navigation'

/**
 * Redirect non-localized /admin/testimonials to the canonical
 * localized route /fr/admin/testimonials.
 * The implementation lives in app/[locale]/admin/testimonials/page.tsx.
 */
export default function AdminTestimonialsRedirect() {
  redirect('/fr/admin/testimonials')
}
