'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Certificate {
  id: string
  code: string
  studentName: string
  formationTitle: string
  issuedAt: string
  verificationUrl?: string
}

export default function CertificatesPage() {
  const [certificateId, setCertificateId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string; certificate?: Certificate } | null>(null)

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!certificateId.trim()) {
      setResult({ valid: false, message: 'Veuillez entrer un code de certificat' })
      return
    }

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
        message: 'Erreur lors de la vérification'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      <div className="max-w-4xl sm:max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-cjblue mb-3 sm:mb-4">Vérification de Certificats</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Vérifiez l'authenticité de vos certificats CJ Development Training Center
          </p>
        </div>

        {/* Formulaire de vérification */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Vérifier un certificat</h2>
          <form onSubmit={handleVerify} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                Code du certificat *
              </label>
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                placeholder="Ex: CJ-DTC-2024-001"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cjblue focus:border-cjblue text-sm sm:text-base lg:text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cjblue text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8v8a8 8 0 018-8 0 018-8 0 018-8z"></path>
                  </svg>
                  Vérification en cours...
                </span>
              ) : (
                'Vérifier le certificat'
              )}
            </button>
          </form>
        </div>

        {/* Résultat de la vérification */}
        {result && (
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${
            result.valid 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {result.valid ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-2 7.071 7.071l-5.657-5.657a1 1 0 00-1.414 0-1.414l5.657 5.657a1 1 0 001.414 0 1.414z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M12 17h-7" />
                  </svg>
                )}
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
                  result.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.valid ? '✅ Certificat valide' : '❌ Certificat invalide'}
                </h3>
                <p className={`text-sm ${
                  result.valid ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
                
                {result.valid && result.certificate && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Détails du certificat</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Étudiant:</span>
                        <p className="font-medium text-sm sm:text-base">{result.certificate.studentName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Formation:</span>
                        <p className="font-medium text-sm sm:text-base">{result.certificate.formationTitle}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Code:</span>
                        <p className="font-medium text-sm sm:text-base">{result.certificate.code}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date d'émission:</span>
                        <p className="font-medium text-sm sm:text-base">
                          {new Date(result.certificate.issuedAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {result.certificate.verificationUrl && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-200">
                        <Link
                          href={result.certificate.verificationUrl}
                          target="_blank"
                          className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                          Vérifier en ligne
                          <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 002-2z" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions supplémentaires */}
        <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">Comment vérifier votre certificat</h3>
          <div className="space-y-2 sm:space-y-3 text-sm text-blue-800">
            <p><strong>1. Via ce formulaire:</strong> Entrez le code unique figurant sur votre certificat et cliquez sur "Vérifier".</p>
            <p><strong>2. Via le site officiel:</strong> Chaque certificat dispose d'un QR code et d'une URL de vérification unique.</p>
            <p><strong>3. Points de vérification:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Le code du certificat est unique et ne peut être utilisé qu'une seule fois</li>
              <li>La date d'émission et le nom de l'étudiant correspondent à nos dossiers</li>
              <li>Le certificat est authentifié par notre système de traçabilité blockchain</li>
            </ul>
          </div>
        </div>

        {/* Contact support */}
        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Besoin d'aide ?</h3>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Si vous rencontrez des difficultés pour vérifier votre certificat ou si vous avez des questions, notre équipe est là pour vous aider.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/fr/contact"
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-cjblue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contacter le support
            </Link>
            <Link
              href="mailto:verification@cjdtc.com"
              className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-cjblue border-2 border-cjblue rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 7.5M12 22h4a2 2 0 002-2v-4a2 2 0 002-2H7a2 2 0 002-2V8a2 2 0 002-2z" />
              </svg>
              Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
