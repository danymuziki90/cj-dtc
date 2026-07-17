'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Sparkles, HelpCircle } from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminPanel,
  AdminPanelHeader,
  adminPrimaryButtonClassName,
  adminSecondaryButtonClassName,
  adminInputClassName,
  adminTextareaClassName
} from '@/components/admin-portal/ui'

type Template = {
  id: string
  subject: string
  body: string
}

const TEMPLATE_NAMES: Record<string, string> = {
  accepted: 'Acceptation de candidature',
  rejected: 'Refus de candidature',
  waitlist: 'Mise sur liste d\'attente',
  cancelled: 'Annulation d\'inscription'
}

const VARIABLES = [
  { name: '{{Nom_etudiant}}', desc: 'Le nom et prénom complet de l\'étudiant' },
  { name: '{{Formation}}', desc: 'Le titre du parcours de formation' },
  { name: '{{Session}}', desc: 'Le nom ou l\'identifiant de la session' },
  { name: '{{Dates}}', desc: 'Les dates de début et de fin de la session' },
  { name: '{{Lieu}}', desc: 'Le lieu ou le format (Présentiel / Distanciel)' },
  { name: '{{Justification}}', desc: 'Le commentaire / motif fourni par l\'administrateur lors de la décision' },
  { name: '{{Coordonnees_contact}}', desc: 'L\'adresse e-mail de contact du support' },
  { name: '{{Signature}}', desc: 'La signature officielle de l\'établissement' }
]

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('accepted')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Current template editing state
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/admin/email-templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data)
          const current = data.find((t: Template) => t.id === selectedTemplateId)
          if (current) {
            setSubject(current.subject)
            setBody(current.body)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [])

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    setFeedback(null)
    const found = templates.find(t => t.id === id)
    if (found) {
      setSubject(found.subject)
      setBody(found.body)
    } else {
      setSubject('')
      setBody('')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTemplateId,
          subject,
          body
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t))
        setFeedback({ type: 'success', message: 'Modèle d\'e-mail enregistré avec succès.' })
      } else {
        const errData = await response.json()
        setFeedback({ type: 'error', message: errData.error || 'Erreur lors de la sauvegarde.' })
      }
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Erreur réseau.' })
    } finally {
      setSaving(false)
    }
  }

  // Generate real-time replacement mock for the preview panel
  const getPreviewText = (text: string) => {
    const vars: Record<string, string> = {
      Nom_etudiant: 'Nicole Zephonie',
      Formation: 'Master RH & Management',
      Session: 'Cohorte RH - Printemps 2026',
      Dates: '15 Mars au 30 Juin 2026',
      Lieu: 'Campus CJ DTC / Hybride',
      Justification: 'Votre profil professionnel correspond parfaitement aux prérequis exigés pour cette formation de niveau master.',
      Coordonnees_contact: 'contact@cjdevelopmenttc.org',
      Signature: 'CJ Development Training Center'
    }
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || vars[key.toLowerCase()] || `[${key}]`)
  }

  return (
    <AdminShell title="Personnalisation des e-mails">
      <div className="space-y-6 font-sans">
        
        {/* Header toolbar */}
        <div className="flex flex-col gap-3 rounded-[26px] border border-slate-200 bg-white/92 px-5 py-4 shadow-[0_20px_55px_-44px_rgba(15,23,42,0.28)] md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.push('/admin/enrollments')}
            className={adminSecondaryButtonClassName}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux inscriptions
          </button>
          <div className="flex gap-2">
            {Object.keys(TEMPLATE_NAMES).map((id) => (
              <button
                key={id}
                onClick={() => handleSelectTemplate(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedTemplateId === id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {TEMPLATE_NAMES[id]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <AdminPanel>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="mt-4 text-sm text-slate-500 font-bold">Chargement des modèles d'e-mails...</p>
            </div>
          </AdminPanel>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Editor column */}
            <div className="lg:col-span-2 space-y-6">
              <AdminPanel className="p-6">
                <AdminPanelHeader
                  eyebrow="Éditeur de message"
                  title={TEMPLATE_NAMES[selectedTemplateId]}
                  description="Modifiez le sujet et le contenu. Utilisez les variables dynamiques de droite pour personnaliser le texte."
                />

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Sujet de l'e-mail
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Sujet de l'e-mail"
                      className={`${adminInputClassName} w-full`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Corps de l'e-mail
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Bonjour {{Nom_etudiant}}, ..."
                      className={`${adminTextareaClassName} w-full min-h-[350px] font-mono text-xs`}
                      rows={14}
                    />
                  </div>

                  {feedback && (
                    <div className={`p-4 rounded-xl border text-xs font-bold ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      {feedback.message}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !subject.trim() || !body.trim()}
                      className={adminPrimaryButtonClassName}
                    >
                      {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...</>
                      ) : (
                        <><Save className="h-4 w-4" /> Sauvegarder ce modèle</>
                      )}
                    </button>
                  </div>
                </div>
              </AdminPanel>

              {/* Real-time Preview Panel */}
              <AdminPanel className="p-6 bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900">Aperçu en temps réel (Exemple de rendu)</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-900 p-4 text-white">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sujet de l'e-mail</div>
                    <div className="text-sm font-extrabold mt-1">{getPreviewText(subject) || '(Sans sujet)'}</div>
                  </div>
                  <div className="p-5 text-xs text-slate-700 font-semibold space-y-2 whitespace-pre-line leading-relaxed min-h-[150px]">
                    {getPreviewText(body) || '(Contenu vide)'}
                  </div>
                </div>
              </AdminPanel>
            </div>

            {/* Variable guide column */}
            <div className="space-y-6">
              <AdminPanel className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900">Variables dynamiques</h3>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mb-4">
                  Copiez et collez ces variables n'importe où dans le sujet ou le corps du message. Elles seront automatiquement remplacées par les vraies valeurs du candidat au moment de l'envoi.
                </p>
                <div className="space-y-3">
                  {VARIABLES.map((v) => (
                    <div
                      key={v.name}
                      onClick={() => {
                        navigator.clipboard.writeText(v.name)
                        alert(`Variable ${v.name} copiée !`)
                      }}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/85 rounded-xl cursor-pointer transition select-all"
                      title="Cliquez pour copier"
                    >
                      <code className="text-xs font-black text-blue-750 block mb-0.5">{v.name}</code>
                      <span className="text-[10px] text-slate-500 font-semibold leading-normal">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            </div>

          </div>
        )}
      </div>
    </AdminShell>
  )
}
