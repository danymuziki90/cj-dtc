'use client'

import { useEffect } from 'react'
import { reportWebVitals, type Metric } from '../../lib/analytics'

export default function WebVitals() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Import web-vitals library dynamically
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVitals)
      onFCP(reportWebVitals)
      onLCP(reportWebVitals)
      onTTFB(reportWebVitals)
      onINP(reportWebVitals)
    }).catch((error) => {
      // web-vitals library not installed, skip silently
      if (process.env.NODE_ENV === 'development') {
        console.warn('web-vitals not installed. Install with: npm install web-vitals')
      }
    })
  }, [])

  return null
}
