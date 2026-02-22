'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: '📊' },
    { name: 'Inscriptions', href: '/admin/inscriptions', icon: '📝' },
    { name: 'Étudiants', href: '/admin/students', icon: '👥' },
    { name: 'Gestion Étudiants', href: '/admin/students-management', icon: '👤' },
    { name: 'Formations', href: '/admin/formations', icon: '📚' },
    { name: 'Cours', href: '/admin/courses-management', icon: '📖' },
    { name: 'Examens', href: '/admin/exams-management', icon: '📝' },
    { name: 'Soumissions', href: '/admin/submissions', icon: '📁' },
    { name: 'Certificats', href: '/admin/certificates', icon: '🎓' },
    { name: 'Soutenances', href: '/admin/defenses', icon: '🎯' },
    { name: 'Rapports', href: '/admin/reports', icon: '📈' },
    { name: 'Paramètres', href: '/admin/settings', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between h-12 px-3 bg-blue-600">
            <span className="text-white font-semibold text-sm">CJ DTC Admin</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-white hover:text-gray-200"
              aria-label="Fermer le menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="mr-2 text-base">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-12 px-3 bg-blue-600 shrink-0">
            <span className="text-white font-semibold text-sm">CJ DTC Admin</span>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
              >
                <span className="mr-2 text-base">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-200 shrink-0">
            <div className="flex items-center">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-semibold text-xs">
                  {session?.user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - compact */}
        <div className="sticky top-0 z-40 flex h-12 items-center bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="flex-1 text-sm font-semibold text-gray-900">Administration</span>
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-blue-600 font-semibold text-xs">
              {session?.user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
