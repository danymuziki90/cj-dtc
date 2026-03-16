'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, GraduationCap, Mail, MapPin, PencilLine, Phone, User } from 'lucide-react'
import {
  StudentEmptyState,
  StudentPageShell,
  StudentSectionCard,
  studentInputClassName,
  studentMutedButtonClassName,
  studentPrimaryButtonClassName,
  studentSecondaryButtonClassName,
  studentSurfaceButtonClassName,
  type StudentMetric,
} from '@/components/ui/student-space'

interface StudentProfile {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  enrollmentsCount: number
  certificatesCount: number
  totalFormations: number
}

export default function MonComptePage() {
  const params = useParams<{ locale?: string }>()
  const locale = params?.locale || 'fr'

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const metrics = useMemo<StudentMetric[]>(() => {
    if (!profile) return []
    return [
      {
        label: 'Inscriptions',
        value: profile.enrollmentsCount,
        helper: 'Parcours rattaches a votre compte.',
        icon: GraduationCap,
        accent: 'from-[#0c4da2] via-[var(--cj-blue)] to-[#02142f]',
      },
      {
        label: 'Formations',
        value: profile.totalFormations,
        helper: 'Programmes suivis ou deja engages.',
        icon: BookOpen,
        accent: 'from-[#003b96] via-[var(--cj-blue)] to-[#0f172a]',
      },
      {
        label: 'Certificats',
        value: profile.certificatesCount,
        helper: 'Documents emis et disponibles.',
        icon: Award,
        accent: 'from-[var(--cj-red)] via-[#bb111d] to-[#4a0b14]',
      },
    ]
  }, [profile])

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/enrollments')
      const data = await response.json()
      if (data.length > 0) {
        const enrollment = data[0]
        setProfile({
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          email: enrollment.email,
          phone: enrollment.phone,
          address: enrollment.address,
          enrollmentsCount: data.length,
          certificatesCount: 0,
          totalFormations: new Set(data.map((item: any) => item.formation.id)).size,
        })
        setFormData({
          firstName: enrollment.firstName,
          lastName: enrollment.lastName,
          email: enrollment.email,
          phone: enrollment.phone || '',
          address: enrollment.address || '',
        })
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      alert('Profil mis a jour avec succes!')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Erreur lors de la mise a jour:', error)
      alert('Erreur lors de la mise a jour du profil')
    }
  }

  if (loading) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Mon compte"
        description="Chargement de votre profil, de vos inscriptions et des informations rattachees a votre espace personnel."
        icon={User}
      >
        <StudentSectionCard
          eyebrow="Profil"
          title="Preparation des informations"
          description="Nous recuperons vos donnees personnelles et votre activite de formation."
          icon={User}
        >
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Chargement du profil...
          </div>
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  if (!profile) {
    return (
      <StudentPageShell
        locale={locale}
        eyebrow="Espace etudiant"
        title="Mon compte"
        description="Votre compte permet de centraliser votre identite, vos formations suivies et vos documents."
        icon={User}
      >
        <StudentSectionCard
          eyebrow="Profil"
          title="Aucun profil disponible"
          description="Nous n'avons pas encore trouve de donnees rattachees a cette session."
          icon={User}
        >
          <StudentEmptyState
            title="Aucun profil trouve"
            description="Inscrivez-vous a une session ou reconnectez-vous avec le bon compte pour voir apparaitre vos informations personnelles."
            action={
              <Link href={`/${locale}/programmes`} className={studentPrimaryButtonClassName}>
                Voir les sessions disponibles
              </Link>
            }
          />
        </StudentSectionCard>
      </StudentPageShell>
    )
  }

  return (
    <StudentPageShell
      locale={locale}
      eyebrow="Espace etudiant"
      title="Mon compte"
      description="Retrouvez vos informations personnelles, pilotez vos donnees de contact et accedez rapidement a vos espaces de formation."
      icon={User}
      metrics={metrics}
      actions={
        <button
          onClick={() => setEditing((current) => !current)}
          className={studentSecondaryButtonClassName}
        >
          <PencilLine className="h-4 w-4" />
          {editing ? 'Annuler la modification' : 'Modifier mes informations'}
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <StudentSectionCard
          eyebrow="Identite"
          title="Fiche personnelle"
          description="Votre profil centralise les informations utiles pour les inscriptions, le suivi administratif et les communications."
          icon={User}
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--cj-blue)] text-2xl font-semibold text-white shadow-lg shadow-blue-200">
                  {(profile.firstName?.[0] || 'E').toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Profil etudiant</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{fullName}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Vos donnees de contact servent a la gestion de vos sessions, de vos paiements et de vos certificats.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white bg-white/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Mail className="h-4 w-4 text-[var(--cj-blue)]" />
                    Email principal
                  </div>
                  <p className="mt-2 break-all text-sm font-medium text-slate-900">{profile.email}</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Phone className="h-4 w-4 text-[var(--cj-blue)]" />
                    Telephone
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{profile.phone || 'Non renseigne'}</p>
                </div>
                <div className="rounded-2xl border border-white bg-white/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <MapPin className="h-4 w-4 text-[var(--cj-blue)]" />
                    Adresse
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{profile.address || 'Non renseignee'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {editing ? 'Edition active' : 'Informations en lecture'}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {editing ? 'Mettre a jour mes informations' : 'Resume des informations personnelles'}
              </h3>

              {editing ? (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Prenom *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                        className={studentInputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Nom *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                        className={studentInputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className={studentInputClassName}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Telephone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        className={studentInputClassName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Adresse</label>
                      <textarea
                        value={formData.address}
                        onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                        className={studentInputClassName}
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" className={studentPrimaryButtonClassName}>
                      Enregistrer les modifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className={studentMutedButtonClassName}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Prenom</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{profile.firstName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nom</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{profile.lastName}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</p>
                    <p className="mt-2 break-all text-sm font-medium text-slate-900">{profile.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Telephone</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{profile.phone || 'Non renseigne'}</p>
                  </div>
                  <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Adresse</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{profile.address || 'Non renseignee'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </StudentSectionCard>

        <StudentSectionCard
          eyebrow="Acces rapides"
          title="Vos espaces utiles"
          description="Retrouvez rapidement les sections les plus consultees de votre parcours."
          icon={BookOpen}
        >
          <div className="grid gap-3">
            <Link href={`/${locale}/espace-etudiants/mes-formations`} className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <p className="text-sm font-semibold text-slate-950">Mes formations</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Consultez vos programmes, vos parcours et vos prochaines sessions.</p>
            </Link>
            <Link href={`/${locale}/espace-etudiants/mes-certificats`} className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <p className="text-sm font-semibold text-slate-950">Mes certificats</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Retrouvez vos documents valides et les liens de verification associes.</p>
            </Link>
            <Link href={`/${locale}/espace-etudiants/travaux`} className="group rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_16px_40px_-30px_rgba(0,45,114,0.35)]">
              <p className="text-sm font-semibold text-slate-950">Travaux et projets</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Deposez vos livrables et suivez vos validations pedagogiques.</p>
            </Link>
          </div>

          <div className="mt-5 rounded-3xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--cj-red)]">Bonnes pratiques</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gardez vos coordonnees a jour pour recevoir les confirmations de session, les informations de paiement et les liens de verification de certificat.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/${locale}/espace-etudiants/supports`} className={studentSurfaceButtonClassName}>
                Voir les supports
              </Link>
              <Link href={`/${locale}/espace-etudiants`} className={studentMutedButtonClassName}>
                Revenir au dashboard
              </Link>
            </div>
          </div>
        </StudentSectionCard>
      </div>
    </StudentPageShell>
  )
}
