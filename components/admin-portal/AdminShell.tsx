'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/submissions', label: 'Submissions' },
]

export default function AdminShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-white p-4 shadow-sm md:block">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Admin Panel</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="mt-6 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-70"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </aside>

        <main className="flex-1 rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="md:hidden">
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
