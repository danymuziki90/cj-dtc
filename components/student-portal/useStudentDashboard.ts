'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { StudentPortalPayload } from '@/lib/student-portal/types'

export function useStudentDashboardData() {
  const router = useRouter()
  const [data, setData] = useState<StudentPortalPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/student/system/dashboard', { cache: 'no-store' })
      if (response.status === 401 || response.status === 403) {
        router.push('/student/login')
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error || 'Impossible de charger vos donnees.')
        return
      }

      const payload = (await response.json()) as StudentPortalPayload
      setData(payload)
    } catch {
      setError('Impossible de charger vos donnees.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refresh: loadData,
  }
}
