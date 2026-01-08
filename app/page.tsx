import Link from 'next/link'
import HomeSections from '../components/HomeSections'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold text-cjblue">CJ DEVELOPMENT TRAINING CENTER</h1>
          <p className="mt-4 text-lg">Bâtir des compétences. Transformer des destins. Créer des opportunités.</p>
          <div className="mt-6">
            <Link href='/formations' className="btn-primary">Découvrir nos formations</Link>
          </div>
        </div>
        <div>
          <img src="/hero-placeholder.jpg" alt="CJ DEVELOPMENT TRAINING CENTER" className="rounded shadow-lg" />
        </div>
      </section>

      <HomeSections />

    </div>
  )
}
