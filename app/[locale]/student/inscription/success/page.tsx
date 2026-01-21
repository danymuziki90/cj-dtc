'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/student/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      
      {/* Success Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Inscription soumise avec succès !
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Votre demande d'inscription a bien été enregistrée. Nous allons l'examiner et vous contacterons sous peu.
        </p>
      </div>

      {/* Success Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 mb-8">
        <div className="space-y-6">
          
          {/* What's Next */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Que se passe-t-il maintenant ?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Examen de votre dossier</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Notre équipe examine votre demande dans les 24-48 heures ouvrées.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email de confirmation</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Vous recevrez un email avec la décision concernant votre inscription.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Finalisation</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Si accepté, vous pourrez finaliser votre inscription et accéder à votre espace étudiant.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Informations importantes</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vérifiez régulièrement votre boîte de réception (y compris les spams)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Préparez les documents nécessaires pour la finalisation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vous pouvez suivre l'état de votre demande depuis votre tableau de bord</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Besoin d'aide ?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-blue-600">contact@cjdtc.com</p>
              </div>
              <div>
                <p className="text-gray-600">Téléphone</p>
                <p className="font-medium text-blue-600">+243 123 456 789</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/student/dashboard"
          className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Accéder à mon tableau de bord
        </Link>
        <Link
          href="/formations"
          className="px-6 sm:px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
        >
          Voir d'autres formations
        </Link>
      </div>

      {/* Auto-redirect Notice */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Redirection automatique vers votre tableau de bord dans {countdown} secondes...
        </p>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
        >
          Accéder maintenant
        </button>
      </div>
    </div>
  )
}
