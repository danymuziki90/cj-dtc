import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ sessionId?: string; formationId?: string }>
}

export default async function InscriptionRedirectPage({ searchParams }: Props) {
  const resolvedParams = await Promise.resolve(searchParams)
  const sessionId = resolvedParams.sessionId
  const formationId = resolvedParams.formationId

  if (sessionId || formationId) {
    const params = new URLSearchParams()
    if (sessionId) params.set('sessionId', sessionId)
    if (formationId) params.set('formationId', formationId)
    redirect(`/espace-etudiants/confirm-inscription?${params.toString()}`)
  }

  redirect('/sessions')
}
