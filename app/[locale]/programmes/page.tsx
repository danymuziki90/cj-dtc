'use client'

export default function ProgrammesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-cjblue mb-8">Nos Programmes</h1>
      <p className="text-lg text-gray-600 mb-8">
        Découvrez nos programmes de formation professionnelle et de leadership.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cjblue mb-4">Programmes de Formation</h2>
          <p className="text-gray-700">
            Des programmes complets adaptés aux besoins du marché africain et international.
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cjblue mb-4">Programmes de Leadership</h2>
          <p className="text-gray-700">
            Développez vos compétences en leadership et management.
          </p>
        </div>
      </div>
    </div>
  )
}
