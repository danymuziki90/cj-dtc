import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
  title: 'Vérification d\'Authenticité des Certificats | CJ DTC',
  description: 'Vérifiez l\'authenticité et la validité d\'un certificat professionnel délivré par CJ Development Training Center grâce à son numéro unique.',
  keywords: ['vérification certificat', 'authenticité diplôme', 'vérifier certificat CJ DTC', 'contrôle attestation'],
  path: '/verification',
})

export default function VerificationLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
