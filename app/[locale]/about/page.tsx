'use client'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-cjblue mb-8 text-center">À Propos</h1>

        {/* Qui sommes-nous */}
        <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-cjblue mb-6">Qui sommes-nous ?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            CJ DEVELOPMENT TRAINING CENTER (CJ DTC) est une institution panafricaine
            spécialisée dans la formation professionnelle, l'insertion, le leadership et la gestion
            stratégique des talents.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Représenté dans plus de 10 pays africains, le centre accompagne les jeunes, les
            professionnels et les institutions dans la montée en compétence et l'excellence
            opérationnelle.
          </p>
        </section>

        {/* Mission et Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cjblue mb-4">Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              Former, accompagner et insérer durablement les talents africains en renforçant leurs
              compétences techniques, managériales et comportementales.
            </p>
          </section>

          <section className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-cjblue mb-4">Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              Devenir la référence panafricaine du Management des Ressources Humaines et de
              l'Insertion Professionnelle, un acteur incontournable de la transformation socio-économique
              du continent.
            </p>
          </section>
        </div>

        {/* Valeurs */}
        <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-cjblue mb-6">Valeurs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cjblue rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Engagement</h3>
                <p className="text-gray-600">Implication totale dans chaque parcours de formation.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cjblue rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Excellence</h3>
                <p className="text-gray-600">Rigueur académique et performance opérationnelle.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cjblue rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Intégrité</h3>
                <p className="text-gray-600">Transparence, éthique et responsabilité.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cjblue rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Innovation</h3>
                <p className="text-gray-600">Solutions modernes adaptées au contexte africain.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 md:col-span-2">
              <div className="w-2 h-2 bg-cjblue rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Impact social</h3>
                <p className="text-gray-600">Transformation durable des communautés.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Historique */}
        <section className="mb-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-cjblue mb-6">Historique (résumé)</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-cjblue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2018</div>
              <p className="text-gray-700">Fondation du centre à Kinshasa (RDC).</p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-cjblue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2019</div>
              <p className="text-gray-700">Lancement du programme IOP.</p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-cjblue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2020-2024</div>
              <p className="text-gray-700">Expansion dans 10 pays africains, structuration du réseau d'ambassadeurs.</p>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-cjblue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2025</div>
              <p className="text-gray-700">Consolidation institutionnelle, 29 promotions diplômées, plus de 8 500 jeunes impactés.</p>
            </div>
          </div>
        </section>

        {/* Présence géographique */}
        <section className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-cjblue mb-6">Présence géographique</h2>
          <p className="text-lg text-gray-700 mb-6">
            RDC (siège), Cameroun, Côte d'Ivoire, Gabon, Togo, Guinée, Centrafrique, Bénin, Guinée,
            Congo-Brazzaville...
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'RDC (siège)',
              'Cameroun',
              'Côte d\'Ivoire',
              'Gabon',
              'Togo',
              'Guinée',
              'Centrafrique',
              'Bénin',
              'Guinée',
              'Congo-Brazzaville'
            ].map((country, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3 text-center">
                <span className="text-cjblue font-medium">{country}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
