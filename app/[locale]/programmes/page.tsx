import { redirect } from 'next/navigation'

// La page "Nos Sessions" a été fusionnée avec la page Formations.
// Toute visite de /[locale]/programmes est redirigée vers /[locale]/formations#sessions.

interface Props {
  params: Promise<{ locale: string }> | { locale: string }
}

export default async function ProgrammesRedirectPage({ params }: Props) {
  const { locale } = await Promise.resolve(params)
  redirect(`/${locale}/formations#sessions`)
}
