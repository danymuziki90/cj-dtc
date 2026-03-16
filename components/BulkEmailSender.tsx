'use client'

import { useState } from 'react'
import { Mail, SendHorizonal, Sparkles } from 'lucide-react'
import {
  AdminBadge,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminInputClassName,
  adminTextareaClassName,
} from '@/components/admin-portal/ui'

interface BulkEmailSenderProps {
  acceptedEnrollments: Array<{ id: number; formation: { id: number; title: string; slug: string } }>
}

export default function BulkEmailSender({ acceptedEnrollments }: BulkEmailSenderProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleSend(event: React.FormEvent) {
    event.preventDefault()

    if (!subject.trim() || !message.trim()) {
      setResult({ type: 'error', message: 'Le sujet et le message sont obligatoires.' })
      return
    }

    if (acceptedEnrollments.length === 0) {
      setResult({ type: 'error', message: 'Aucune inscription acceptee a traiter.' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/enrollments/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: acceptedEnrollments.map((enrollment) => enrollment.id),
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi des emails.")
      }

      setResult({
        type: 'success',
        message: `Email envoye a ${data.sent} destinataire${data.sent > 1 ? 's' : ''}.`,
      })
      setSubject('')
      setMessage('')
      setShowForm(false)
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur de connexion au serveur.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        eyebrow="Communication"
        title="Envoyer un email en masse"
        description="Adressez rapidement une communication ciblee aux dossiers deja acceptes depuis le back-office."
        actions={
          <>
            <AdminBadge tone="primary">{acceptedEnrollments.length} destinataire(s)</AdminBadge>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className={showForm ? adminSecondaryButtonClassName : adminPrimaryButtonClassName}
            >
              {showForm ? 'Fermer le composeur' : 'Composer un email'}
            </button>
          </>
        }
      />

      {result ? (
        <div
          className={`mt-5 rounded-[22px] border px-4 py-3 text-sm ${
            result.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {result.message}
        </div>
      ) : null}

      {showForm ? (
        acceptedEnrollments.length > 0 ? (
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Objet du mail</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Ex. Votre inscription a bien ete retenue"
                    className={adminInputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Utilisez {firstName}, {lastName}, {email}, {formationTitle} dans votre message."
                    rows={8}
                    className={`${adminTextareaClassName} font-mono text-sm`}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Aide rapide</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p className="inline-flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-[var(--admin-primary)]" />
                    Variables disponibles: {'{'}firstName{'}'}, {'{'}lastName{'}'}, {'{'}email{'}'}, {'{'}formationTitle{'}'}.
                  </p>
                  <p className="inline-flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-[var(--admin-primary)]" />
                    Seules les inscriptions avec statut accepte sont inclues dans l'envoi.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowForm(false)} className={adminSecondaryButtonClassName}>
                Annuler
              </button>
              <button type="submit" disabled={isLoading} className={adminPrimaryButtonClassName}>
                <SendHorizonal className="h-4 w-4" />
                {isLoading
                  ? 'Envoi en cours...'
                  : `Envoyer a ${acceptedEnrollments.length} destinataire${acceptedEnrollments.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <AdminEmptyState
              title="Aucun destinataire disponible"
              description="Les emails en masse sont actives uniquement lorsqu'au moins une inscription est au statut accepte."
            />
          </div>
        )
      ) : null}
    </AdminPanel>
  )
}
