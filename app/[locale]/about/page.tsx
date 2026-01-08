'use client'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-cjblue mb-6">À propos de nous</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notre Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            CJ DEVELOPMENT TRAINING CENTER est un centre panafricain de formation professionnelle, 
            de leadership et d'insertion. Notre mission est de bâtir des compétences et transformer 
            des destins en offrant des formations de qualité adaptées aux besoins du marché africain 
            et international.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Nos Valeurs</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Excellence dans la formation</li>
            <li>Innovation pédagogique</li>
            <li>Insertion professionnelle</li>
            <li>Développement panafricain</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Notre Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            Devenir le leader de la formation professionnelle en Afrique, en formant une nouvelle 
            génération de professionnels compétents, éthiques et engagés pour le développement 
            du continent.
          </p>
        </section>
      </div>
    </div>
  )
}
