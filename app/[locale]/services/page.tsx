'use client'

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-cjblue mb-8">Services aux Entreprises</h1>
      <p className="text-lg text-gray-600 mb-8">
        Des solutions de formation sur mesure pour votre entreprise.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cjblue mb-3">Formation sur mesure</h2>
          <p className="text-gray-700">
            Programmes adaptés aux besoins spécifiques de votre entreprise.
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cjblue mb-3">Consultation</h2>
          <p className="text-gray-700">
            Accompagnement et conseil pour le développement de vos équipes.
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-cjblue mb-3">Certification</h2>
          <p className="text-gray-700">
            Certification de vos collaborateurs avec des programmes reconnus.
          </p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <a href="/fr/contact" className="btn-primary">
          Contactez-nous pour plus d'informations
        </a>
      </div>
    </div>
  )
}
