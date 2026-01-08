import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  let list: any[] = []

  try {
    list = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cjblue">Actualités</h2>
        <Link href="/admin/articles/new" className="btn-primary">Nouvel article</Link>
      </div>
      {list.length === 0 ? (
        <div className="mt-6 p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">Aucun article trouvé. Vérifiez votre connexion à la base de données.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map(a => (
            <li key={a.id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{a.title} {a.published ? <span className="text-sm text-green-600">Publié</span> : <span className="text-sm text-gray-500">Brouillon</span>}</h3>
                  <p className="text-sm text-gray-600">{a.slug}</p>
                </div>
                <div>
                  <Link href={`/admin/articles/${a.id}/edit`} className="text-sm text-cjblue">Modifier</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
