import Link from 'next/link'

export default function AdminHeader() {
  return (
    <header className="bg-cjblue text-white py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/logo.png" alt="CJ DEVELOPMENT TRAINING CENTER" className="h-10" />
          <h1 className="font-bold">CJ DEVELOPMENT TRAINING CENTER — Admin</h1>
        </Link>
        <nav className="flex gap-4">
          <Link href="/admin/formations">Formations</Link>
          <Link href="/admin/sessions">Sessions</Link>
          <Link href="/admin/articles">Actualités</Link>
          <Link href="/admin/enrollments">Inscriptions</Link>
          <Link href="/admin/payments">Paiements</Link>
          <Link href="/admin/invoices">Factures</Link>
        </nav>
      </div>
    </header>
  )
}
