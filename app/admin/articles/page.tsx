import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  let articles: any[] = []

  try {
    articles = await prisma.article.findMany({ 
      orderBy: { createdAt: 'desc' }
    })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-cjblue">Gestion des Actualités</h2>
        <div className="flex space-x-3">
          <Link href="/admin/articles/new" className="btn-primary">Nouvel article</Link>
          <Link href="/fr/actualites" className="text-cjblue hover:underline" target="_blank">
            Voir le site →
          </Link>
        </div>
      </div>
      
      {articles.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-6 0l-2 2m2-2l2 2m-2-2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8h6z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun article trouvé</h3>
          <p className="text-gray-600 mb-4">Vérifiez votre connexion à la base de données ou créez votre premier article.</p>
          <Link href="/admin/articles/new" className="inline-flex items-center px-4 py-2 bg-cjblue text-white rounded-lg hover:bg-blue-700 transition-colors">
            Créer le premier article
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500">/{article.slug}</div>
                        {article.excerpt && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">{article.excerpt}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        article.published 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <Link 
                        href={`/fr/actualites/${article.slug}`} 
                        className="text-cjblue hover:text-blue-700 mr-3"
                        target="_blank"
                        title="Voir sur le site"
                      >
                        👁️
                      </Link>
                      <Link 
                        href={`/admin/articles/${article.id}/edit`} 
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Modifier"
                      >
                        ✏️
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                        onClick={() => {
                          if (confirm(`Êtes-vous sûr de vouloir supprimer "${article.title}" ?`)) {
                            // TODO: Implementer la suppression
                            console.log('Supprimer article:', article.id)
                          }
                        }}
                      >
                        🗑️
                      </button>
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
