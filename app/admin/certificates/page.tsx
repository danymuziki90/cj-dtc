import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CertificatesPage() {
  let certificates: any[] = []

  try {
    certificates = await prisma.certificate.findMany({ 
      orderBy: { issuedAt: 'desc' },
      include: { 
        formation: true,
        user: true
      }
    })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-cjblue">Gestion des Certificats</h2>
        <div className="flex space-x-3">
          <Link href="/fr/certificates" className="text-cjblue hover:underline" target="_blank">
            Voir le site →
          </Link>
        </div>
      </div>
      
      {certificates.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4.5m0 4.5L21 12m-9 0h6a2 2 0 002-2v4a2 2 0 002 2H9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun certificat trouvé</h3>
          <p className="text-gray-600 mb-4">Vérifiez votre connexion à la base de données ou les certificats seront générés lors de la complétion des formations.</p>
          <Link href="/fr/formations" className="inline-flex items-center px-4 py-2 bg-cjblue text-white rounded-lg hover:bg-blue-700 transition-colors">
            Voir les formations
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Émis le</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">🏆</span>
                          <div>
                            <div className="font-medium text-gray-900">{cert.code}</div>
                            <div className="text-sm text-gray-500">{cert.formation?.title || '—'}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {cert.verificationUrl && (
                            <Link 
                              href={cert.verificationUrl} 
                              target="_blank"
                              className="text-cjblue hover:underline"
                            >
                              Vérifier en ligne
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cert.user?.name || 'Étudiant'}</div>
                        <div className="text-sm text-gray-500">{cert.user?.email || '—'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{cert.formation?.title || '—'}</div>
                      <div className="text-xs text-gray-500">ID: {cert.formationId || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link 
                        href={`/fr/certificates?certificateId=${cert.code}`}
                        className="text-cjblue hover:text-blue-700 mr-3"
                        target="_blank"
                        title="Voir le certificat"
                      >
                        👁️
                      </Link>
                      <Link 
                        href={`/api/certificates/download/${cert.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Télécharger"
                      >
                        📥
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
