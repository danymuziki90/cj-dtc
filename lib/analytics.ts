// Core Web Vitals monitoring
// This file provides utilities for tracking Core Web Vitals

export interface Metric {
  name: string
  value: number
  id: string
  delta: number
  entries: PerformanceEntry[]
}

export function reportWebVitals(metric: Metric) {
  // In production, send to your analytics service
  // Examples: Google Analytics, Vercel Analytics, custom endpoint
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }

  // Example: Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Example: Send to custom endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    }).catch(console.error)
  }
}

// Performance monitoring helper
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now()
    fn()
    const end = performance.now()
    const duration = end - start
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
  fn()
  return 0
}
