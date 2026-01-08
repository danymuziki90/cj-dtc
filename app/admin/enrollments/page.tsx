import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EnrollmentsPage() {
  let enrollments: any[] = []

  try {
    enrollments = await prisma.enrollment.findMany({
      include: {
        formation: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
    return (
      <div>
        <h2 className="text-2xl font-bold text-cjblue mb-6">Inscriptions</h2>
        <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 font-semibold mb-2">Base de données non connectée</p>
          <p className="text-yellow-700 text-sm">
            Veuillez configurer votre base de données dans le fichier .env et exécuter les migrations Prisma.
          </p>
          <p className="text-yellow-700 text-sm mt-2">
            Consultez le fichier SETUP_DATABASE.md pour les instructions.
          </p>
        </div>
      </div>
    )
  }

  // Grouper par formation
  const byFormation = enrollments.reduce((acc, enrollment) => {
    const formationTitle = enrollment.formation.title
    if (!acc[formationTitle]) {
      acc[formationTitle] = []
    }
    acc[formationTitle].push(enrollment)
    return acc
  }, {} as Record<string, typeof enrollments>)

  // Grouper par date de début
  const byStartDate = enrollments.reduce((acc, enrollment) => {
    const dateKey = enrollment.startDate.toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(enrollment)
    return acc
  }, {} as Record<string, typeof enrollments>)

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cjblue">Inscriptions</h2>
        <div className="text-sm text-gray-600">
          Total: {enrollments.length} inscription{enrollments.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Vue par formation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-cjblue mb-4">Par formation</h3>
        <div className="space-y-6">
          {Object.entries(byFormation).map(([formationTitle, formationEnrollments]) => (
            <div key={formationTitle} className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-3">
                {formationTitle} ({formationEnrollments.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nom</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Téléphone</th>
                      <th className="text-left p-2">Date de début</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formationEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {enrollment.firstName} {enrollment.lastName}
                        </td>
                        <td className="p-2">{enrollment.email}</td>
                        <td className="p-2">{enrollment.phone || '—'}</td>
                        <td className="p-2">
                          {new Date(enrollment.startDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">{getStatusBadge(enrollment.status)}</td>
                        <td className="p-2">
                          {new Date(enrollment.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vue par date de début */}
      <div>
        <h3 className="text-xl font-semibold text-cjblue mb-4">Par date de début</h3>
        <div className="space-y-6">
          {Object.entries(byStartDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, dateEnrollments]) => (
              <div key={dateKey} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">
                  {new Date(dateKey).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} ({dateEnrollments.length})
                </h4>
                <div className="space-y-2">
                  {dateEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">
                          {enrollment.firstName} {enrollment.lastName}
                        </span>
                        <span className="text-gray-600 ml-2">
                          — {enrollment.formation.title}
                        </span>
                        <span className="text-gray-500 ml-2">({enrollment.email})</span>
                      </div>
                      {getStatusBadge(enrollment.status)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
