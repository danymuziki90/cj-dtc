'use client'
'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

type Locale = 'fr' | 'en'

const COPY = {
  fr: {
    title: 'Demander un échange entreprise',
    subtitle: 'Partagez vos besoins. Notre équipe vous revient sous 24h avec une proposition adaptée.',
    company: 'Entreprise / Organisation *',
    companyPh: 'Nom de votre organisation',
    contact: 'Nom du contact *',
    contactPh: 'Prénom et nom',
    position: 'Fonction',
    positionPh: 'DRH, Responsable formation, Directeur…',
    email: 'Adresse e-mail *',
    emailPh: 'votre.email@organisation.com',
    phone: 'Téléphone',
    phonePh: '+243 xxx xxx xxx',
    sector: 'Secteur d\'activité',
    sectorPh: 'Banque, ONG, Industrie, Administration…',
    employees: 'Nombre de collaborateurs',
    employeesPh: 'Ex : 50–200',
    needType: 'Type de besoin *',
    needTypes: [
      'Formation intra-entreprise',
      'Formation sur mesure',
      'Coaching individuel',
      'Coaching d\'équipe',
      'Leadership & management',
      'Accompagnement RH',
      'Gestion des talents',
      'Séminaire / atelier',
      'Conférence professionnelle',
      'Partenariat institutionnel',
      'Autre',
    ],
    message: 'Décrivez votre besoin',
    messagePh: 'Contexte, objectifs, délai souhaité, nombre de participants…',
    submit: 'Envoyer la demande',
    submitting: 'Envoi en cours…',
    successTitle: 'Demande envoyée avec succès.',
    successDesc: 'Notre équipe corporate vous contactera dans les 24h pour organiser un échange.',
    errorGeneric: 'Erreur lors de l\'envoi. Veuillez réessayer.',
    required: 'Champs obligatoires',
  },
  en: {
    title: 'Request a corporate meeting',
    subtitle: 'Share your needs. Our team will get back to you within 24h with a tailored proposal.',
    company: 'Company / Organization *',
    companyPh: 'Name of your organization',
    contact: 'Contact name *',
    contactPh: 'First and last name',
    position: 'Title',
    positionPh: 'CHRO, Training Manager, Director…',
    email: 'Email address *',
    emailPh: 'your.email@organization.com',
    phone: 'Phone',
    phonePh: '+243 xxx xxx xxx',
    sector: 'Industry / Sector',
    sectorPh: 'Banking, NGO, Manufacturing, Government…',
    employees: 'Number of employees',
    employeesPh: 'E.g. 50–200',
    needType: 'Type of need *',
    needTypes: [
      'In-company training',
      'Custom training',
      'Individual coaching',
      'Team coaching',
      'Leadership & management',
      'HR advisory',
      'Talent management',
      'Seminar / workshop',
      'Professional conference',
      'Institutional partnership',
      'Other',
    ],
    message: 'Describe your need',
    messagePh: 'Context, objectives, timeline, number of participants…',
    submit: 'Send request',
    submitting: 'Sending…',
    successTitle: 'Request sent successfully.',
    successDesc: 'Our corporate team will contact you within 24h to schedule a meeting.',
    errorGeneric: 'Error while sending. Please try again.',
    required: 'Required fields',
  },
}

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[var(--cj-blue)] focus:ring-2 focus:ring-[var(--cj-blue)]/15 bg-white'

const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'

export default function EntrepriseContactForm({ locale }: { locale: Locale }) {
  const t = COPY[locale]
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const body = Object.fromEntries(fd.entries())

    try {
      const res = await fetch('/api/contact-entreprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.errorGeneric)
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err.message || t.errorGeneric)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="mb-2 text-2xl font-black text-[var(--cj-blue)]">{t.successTitle}</h3>
        <p className="max-w-sm text-slate-600">{t.successDesc}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-6 text-sm text-slate-500">{t.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1 */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.company}</label>
            <input name="company" required placeholder={t.companyPh} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.contact}</label>
            <input name="contactName" required placeholder={t.contactPh} className={inputCls} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.position}</label>
            <input name="position" placeholder={t.positionPh} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.email}</label>
            <input name="email" type="email" required placeholder={t.emailPh} className={inputCls} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.phone}</label>
            <input name="phone" type="tel" placeholder={t.phonePh} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.sector}</label>
            <input name="sector" placeholder={t.sectorPh} className={inputCls} />
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.employees}</label>
            <input name="employees" placeholder={t.employeesPh} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.needType}</label>
            <select name="needType" required className={inputCls}>
              <option value="">—</option>
              {t.needTypes.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className={labelCls}>{t.message}</label>
          <textarea
            name="message"
            rows={5}
            placeholder={t.messagePh}
            className={inputCls}
          />
        </div>

        {/* Error */}
        {status === 'error' && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--cj-red)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-[var(--cj-red-700)] disabled:opacity-60"
        >
          {status === 'loading' ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {t.submitting}</>
          ) : (
            <><Send className="h-4 w-4" /> {t.submit}</>
          )}
        </button>

        <p className="text-center text-xs text-slate-400">* {t.required}</p>
      </form>
    </div>
  )
}
