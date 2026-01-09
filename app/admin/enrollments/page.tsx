import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import AdminEnrollmentTable from '../../../components/AdminEnrollmentTable'
import BulkEmailSender from '../../../components/BulkEmailSender'

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cjblue">Inscriptions</h2>
        <div className="text-sm text-gray-600">
          Total: {enrollments.length} inscription{enrollments.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Section Email en masse */}
      <BulkEmailSender
        acceptedEnrollments={enrollments.filter(e => e.status === 'accepted')}
      />

      {/* Vue par formation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-cjblue mb-4">Par formation</h3>
        <AdminEnrollmentTable enrollments={enrollments} groupBy="formation" />
      </div>

      {/* Vue par date de début */}
      <div>
        <h3 className="text-xl font-semibold text-cjblue mb-4">Par date de début</h3>
        <AdminEnrollmentTable enrollments={enrollments} groupBy="date" />
      </div>
    </div>
  )
}
