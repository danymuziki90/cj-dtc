import type { Metadata } from 'next'
import AboutModernPage from '@/components/about/AboutModernPage'

export const metadata: Metadata = {
  title: 'A propos',
  description:
    'Decouvrez CJ Development Training Center, son histoire, sa mission et son approche de formation professionnelle orientee resultats.',
}

export default function AboutPage() {
  return <AboutModernPage homeHref="/" formationsHref="/formations" contactHref="/contact" />
}
