'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { resolveSiteLocale } from '@/lib/i18n/locale'
import { publicMessages } from '@/lib/i18n/public-messages'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  homeLabel?: string
  homeHref?: string
}

const labels = publicMessages.breadcrumbs

export default function Breadcrumbs({ items, homeLabel, homeHref }: BreadcrumbsProps) {
  const params = useParams<{ locale?: string }>()
  const locale = resolveSiteLocale(params?.locale)
  const resolvedHomeHref = homeHref || `/${locale}`
  const defaultHomeLabel = labels[locale].home

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.18)] backdrop-blur">
        <li>
          <Link href={resolvedHomeHref} className="inline-flex items-center gap-2 rounded-full px-2 py-1 transition hover:text-[var(--cj-blue)]">
            <Home className="h-4 w-4" />
            {homeLabel || defaultHomeLabel}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-slate-400" />
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded-full px-2 py-1 transition hover:text-[var(--cj-blue)]">
                  {item.label}
                </Link>
              ) : (
                <span className={`rounded-full px-2 py-1 ${isLast ? 'bg-[var(--cj-blue-50)] font-semibold text-[var(--cj-blue)]' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
