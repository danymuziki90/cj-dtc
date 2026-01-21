import Link from 'next/link'
import { prisma } from '../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  let stats = {
    formations: 0,
    articles: 0,
    articlesPublished: 0,
    certificates: 0,
    enrollments: 0,
    enrollmentsPending: 0
  }

  try {
    stats = {
      formations: await prisma.formation.count(),
      articles: await prisma.article.count(),
      articlesPublished: await prisma.article.count({ where: { published: true } }),
      certificates: await prisma.certificate.count(),
      enrollments: await prisma.enrollment.count(),
      enrollmentsPending: await prisma.enrollment.count({ where: { status: 'pending' } })
    }
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
    // En cas d'erreur, on continue avec des stats à zéro
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-cjblue mb-8">Tableau de bord Admin</h1>

      {/* Statistiques */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Formations</h3>
          <p className="text-3xl font-bold text-cjblue">{stats.formations}</p>
        </div>
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Articles</h3>
          <p className="text-3xl font-bold text-cjblue">{stats.articles}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.articlesPublished} publiés</p>
        </div>
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Inscriptions</h3>
          <p className="text-3xl font-bold text-cjblue">{stats.enrollments}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.enrollmentsPending} en attente</p>
        </div>
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Certificats</h3>
          <p className="text-3xl font-bold text-cjblue">{stats.certificates}</p>
        </div>
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Actions rapides</h3>
          <Link href="/admin/formations/new" className="text-cjblue hover:underline text-sm block mt-2">
            + Nouvelle formation
          </Link>
          <Link href="/admin/articles/new" className="text-cjblue hover:underline text-sm block mt-1">
            + Nouvel article
          </Link>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/formations" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les formations</h3>
          <p className="text-gray-600 text-sm">Créer, modifier et supprimer les formations</p>
        </Link>
        <Link href="/admin/articles" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les actualités</h3>
          <p className="text-gray-600 text-sm">Créer et publier des articles</p>
        </Link>
        <Link href="/admin/enrollments" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les inscriptions</h3>
          <p className="text-gray-600 text-sm">Voir et gérer les inscriptions aux formations</p>
        </Link>
        <Link href="/admin/certificates" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les certificats</h3>
          <p className="text-gray-600 text-sm">Voir et gérer les certificats émis</p>
        </Link>
        <Link href="/admin/lms" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Configuration LMS</h3>
          <p className="text-gray-600 text-sm">Configurer l'intégration LMS</p>
        </Link>
        <Link href="/admin/analytics" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Analytics & Statistiques</h3>
          <p className="text-gray-600 text-sm">Tableaux de bord et analyses détaillées</p>
        </Link>
        <Link href="/admin/payments" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les paiements</h3>
          <p className="text-gray-600 text-sm">Enregistrer et suivre les paiements</p>
        </Link>
        <Link href="/admin/invoices" className="p-6 border rounded-lg hover:shadow-lg transition-shadow block">
          <h3 className="font-semibold text-xl text-cjblue mb-2">Gérer les factures</h3>
          <p className="text-gray-600 text-sm">Créer et gérer les factures</p>
        </Link>
      </div>
    </div>
  )
}
