import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FormationsPage() {
  let list: any[] = []

  try {
    list = await prisma.formation.findMany({ orderBy: { createdAt: 'desc' } })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cjblue">Formations</h2>
        <Link href="/admin/formations/new" className="btn-primary">Nouvelle formation</Link>
      </div>
      {list.length === 0 ? (
        <div className="mt-6 p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">Aucune formation trouvée. Vérifiez votre connexion à la base de données.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map(f => (
            <li key={f.id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.slug}</p>
                </div>
                <div>
                  <Link href={`/admin/formations/${f.id}/edit`} className="text-sm text-cjblue">Modifier</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
