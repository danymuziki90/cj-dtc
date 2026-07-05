'use client'

import Link from 'next/link'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import AdminShell from '@/components/admin-portal/AdminShell'
import {
  AdminBadge,
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
  adminInputClassName,
  adminPrimaryButtonClassName,
} from '@/components/admin-portal/ui'

type SearchItem = {
  id: string | number
  label: string
  subtitle: string
  badge: string
  href: string
}

type SearchPayload = {
  query: string
  students: SearchItem[]
  sessions: SearchItem[]
  enrollments: SearchItem[]
  payments: SearchItem[]
  total: number
}

function Group({ title, items }: { title: string; items: SearchItem[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
        <AdminBadge tone="neutral">{items.length}</AdminBadge>
      </div>
      {items.length ? (
        items.map((item) => (
          <Link key={`${title}-${item.id}`} href={item.href} className="block rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-[var(--admin-primary-200)] hover:bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.subtitle}</p>
              </div>
              <AdminBadge tone="primary">{item.badge}</AdminBadge>
            </div>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--admin-primary)]">
              Ouvrir
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))
      ) : (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-sm text-slate-500">
          Aucun resultat dans cette categorie.
        </div>
      )}
    </div>
  )
}

function AdminSearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [data, setData] = useState<SearchPayload | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const currentQuery = (searchParams.get('q') || '').trim()
    setQuery(currentQuery)

    if (currentQuery.length < 2) {
      setData({ query: currentQuery, students: [], sessions: [], enrollments: [], payments: [], total: 0 })
      return
    }

    async function load() {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/system/search?q=${encodeURIComponent(currentQuery)}`, { cache: 'no-store' })
        const payload = (await response.json()) as SearchPayload
        setData(payload)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [searchParams])

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (value.length < 2) return
    router.push(`/admin/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <AdminShell title="Recherche admin">
      <AdminPanel>
        <AdminPanelHeader
          eyebrow="Recherche globale"
          title="Etudiant, session, paiement ou inscription"
          description="Un point d entree unique pour retrouver un dossier sans naviguer entre plusieurs pages."
        />
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, email, reference, formation..." className={`${adminInputClassName} pl-11`} />
          </div>
          <button type="submit" className={adminPrimaryButtonClassName}>Rechercher</button>
        </form>
      </AdminPanel>

      {loading ? (
        <AdminPanel>
          <AdminEmptyState title="Recherche en cours" description="Nous consolidons les resultats sur les espaces etudiants, sessions, inscriptions et paiements." />
        </AdminPanel>
      ) : data && data.query.length < 2 ? (
        <AdminPanel>
          <AdminEmptyState title="Lancez une recherche" description="Saisissez au moins 2 caracteres pour interroger l ensemble des donnees admin." />
        </AdminPanel>
      ) : data && data.total === 0 ? (
        <AdminPanel>
          <AdminEmptyState title="Aucun resultat" description={`Aucun dossier n a ete trouve pour "${data.query}". Essayez un email, une reference de paiement ou un titre de formation.`} />
        </AdminPanel>
      ) : data ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminPanel><Group title="Etudiants" items={data.students} /></AdminPanel>
          <AdminPanel><Group title="Sessions" items={data.sessions} /></AdminPanel>
          <AdminPanel><Group title="Inscriptions" items={data.enrollments} /></AdminPanel>
          <AdminPanel><Group title="Paiements" items={data.payments} /></AdminPanel>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={<AdminShell title="Recherche admin"><AdminPanel><AdminEmptyState title="Chargement de la recherche" description="Le moteur de recherche admin se prepare." /></AdminPanel></AdminShell>}>
      <AdminSearchContent />
    </Suspense>
  )
}
