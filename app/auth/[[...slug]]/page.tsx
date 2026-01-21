import { redirect } from 'next/navigation'

export default async function AuthRedirectPage({
  params,
}: {
  params: Promise<{ slug?: string[] }> | { slug?: string[] }
}) {
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams.slug ?? []
  const suffix = slug.length ? `/${slug.join('/')}` : ''

  redirect(`/fr/auth${suffix}`)
}
