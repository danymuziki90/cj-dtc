import { redirect } from 'next/navigation'

/**
 * Root URL (/) — redirects immediately to the canonical French locale.
 * The [locale]/page.tsx handles the actual homepage rendering.
 */
export default function RootPage() {
  redirect('/fr')
}
