'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const RECENT_SEARCHES_KEY = 'cj-admin-recent-searches'

function readRecentSearches() {
  if (typeof window === 'undefined') return [] as string[]

  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export default function AdminGlobalSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setRecentSearches(readRecentSearches())
  }, [])

  useEffect(() => {
    if (pathname === '/admin/search') {
      const params = new URLSearchParams(window.location.search)
      setQuery(params.get('q') || '')
    }
  }, [pathname])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const suggestions = useMemo(() => {
    if (query.trim()) return []
    return recentSearches.slice(0, 4)
  }, [query, recentSearches])

  function persistSearch(value: string) {
    const next = [value, ...recentSearches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 6)
    setRecentSearches(next)
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  function submitSearch(event?: FormEvent, valueOverride?: string) {
    event?.preventDefault()
    const value = (valueOverride ?? query).trim()
    if (value.length < 2) return
    persistSearch(value)
    setFocused(false)
    router.push(`/admin/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <div className="relative w-full max-w-md">
      <form
        onSubmit={(event) => submitSearch(event)}
        className="flex w-full items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.25)]"
      >
        <Search className="h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Etudiant, session, paiement ou inscription"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          aria-label="Recherche globale admin"
        />
        <button
          type="submit"
          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-[var(--admin-primary-200)] hover:text-[var(--admin-primary)]"
        >
          Ctrl K
        </button>
      </form>

      {focused && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Recherches recentes</p>
          <div className="space-y-1">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => submitSearch(undefined, item)}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <span className="truncate">{item}</span>
                <span className="text-xs text-slate-400">Ouvrir</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}


