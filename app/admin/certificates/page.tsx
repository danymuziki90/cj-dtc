import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CertificatesPage() {
  let list: any[] = []

  try {
    list = await prisma.certificate.findMany({ orderBy: { issuedAt: 'desc' }, include: { formation: true, user: true } })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-cjblue">Certificats émis</h2>
      {list.length === 0 ? (
        <div className="mt-6 p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">Aucun certificat trouvé. Vérifiez votre connexion à la base de données.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map(c => (
            <li key={c.code} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{c.holderName} — {c.code}</h3>
                  <p className="text-sm text-gray-600">{c.formation?.title || '—'}</p>
                  <p className="text-sm text-gray-500">Émis par: {c.issuedBy}</p>
                </div>
                <div>
                  <span className={c.verified ? 'text-green-600' : 'text-gray-500'}>{c.verified ? 'Vérifié' : 'Non vérifié'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
