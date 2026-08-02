import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Offres d'emploi | CJ Development Training Center",
  description:
    "Consultez les offres d'emploi, stages et opportunités professionnelles proposées par le réseau CJ DTC et ses partenaires en Afrique.",
  openGraph: {
    title: "Offres d'emploi — CJ DTC",
    description: "Emplois, stages et opportunités professionnelles du réseau CJ Development Training Center.",
    type: 'website',
  },
}

export default function EmploisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
