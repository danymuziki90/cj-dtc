'use client'

import { useState } from 'react'

export default function CertificatesPage() {
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string; certificate?: any } | null>(null)

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/certificates?certificateId=${certificateId}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setResult({
          valid: true,
          message: 'Certificat valide',
          certificate: data.certificate
        })
      } else {
        setResult({
          valid: false,
          message: data.error || 'Certificat non trouvé ou invalide'
        })
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Erreur lors de la vérification. Veuillez réessayer.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold text-cjblue mb-8">Vérifier un Certificat</h1>
      
      <p className="text-gray-600 mb-8">
        Entrez l'identifiant de votre certificat pour vérifier son authenticité.
      </p>

      <form onSubmit={handleVerify} className="space-y-4 mb-8">
        <div>
          <label htmlFor="certificateId" className="block text-sm font-medium mb-2">
            Identifiant du certificat <span className="text-red-500">*</span>
          </label>
          <input
            id="certificateId"
            type="text"
            required
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Ex: CERT-2024-001"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cjblue"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Vérification en cours...' : 'Vérifier le certificat'}
        </button>
      </form>

      {result && (
        <div className={`p-6 rounded-lg border ${
          result.valid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h2 className={`font-bold text-lg mb-2 ${
            result.valid ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.valid ? '✓ Certificat Valide' : '✗ Certificat Invalide'}
          </h2>
          <p className={result.valid ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </p>
          {result.valid && result.certificate && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-green-700">
                <strong>Nom:</strong> {result.certificate.studentName || 'N/A'}
              </p>
              <p className="text-sm text-green-700">
                <strong>Formation:</strong> {result.certificate.formationName || 'N/A'}
              </p>
              <p className="text-sm text-green-700">
                <strong>Date d'émission:</strong> {
                  result.certificate.issuedAt 
                    ? new Date(result.certificate.issuedAt).toLocaleDateString('fr-FR')
                    : 'N/A'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
