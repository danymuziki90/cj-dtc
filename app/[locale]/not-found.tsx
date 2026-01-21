import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-4xl font-bold text-cjblue mb-4">404</h2>
      <p className="text-xl mb-6">Cette page n'existe pas</p>
      <Link href="/fr" className="btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  )
}
