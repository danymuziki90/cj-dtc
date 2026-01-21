import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-lg shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,45,114,0.85)] to-[rgba(227,6,19,0.7)] animate-hero"></div>
      <div className="relative p-12 text-white">
        <h2 className="text-4xl font-bold">Bâtir des compétences. Transformer des destins.</h2>
        <p className="mt-4 max-w-2xl">Programmes certifiants, parcours IOP, leadership & solutions RH pour les entreprises. Rejoignez notre réseau panafricain.</p>
        <div className="mt-6">
          <Link href="/fr/formations" className="btn-primary inline-block">S'inscrire maintenant</Link>
          <Link href="/fr/programmes/iop" className="btn-secondary inline-block ml-4">Rejoindre le programme IOP</Link>
          <Link href="/fr/formations" className="btn-secondary inline-block ml-4">Découvrir nos formations</Link>
        </div>
      </div>
    </section>
  )
}
