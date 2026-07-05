import { redirect } from 'next/navigation'

export default async function AuthRedirectPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const suffix = slug.length ? `/${slug.join('/')}` : ''

  redirect(`/fr/auth${suffix}`)
}
