import Link from 'next/link'
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="space-y-4 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold uppercase text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            Protection des données
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-slate-400">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              1. Collecte des données personnelles
            </h2>
            <p>
              CJ Development Training Center (CJ DTC) s'engage à protéger la vie privée des utilisateurs de sa plateforme d'apprentissage. Nous collectons uniquement les informations nécessaires au traitement de vos inscriptions, à la délivrance de vos certifications et au suivi de vos sessions de formation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Utilisation de vos données</h2>
            <p>
              Les données personnelles (nom, prénom, e-mail, téléphone) sont utilisées exclusivement pour l'administration de vos cours, l'envoi de vos relevés et diplômes, et la communication des actualités académiques.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Sécurité et hébergement</h2>
            <p>
              Toutes les données transférées sont chiffrées (SSL/TLS). Vos documents et travaux déposés sont stockés dans des infrastructures sécurisées avec des accès strictement restreints.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Vos droits</h2>
            <p>
              Conformément à la réglementation applicable, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles sur simple demande auprès de notre secrétariat.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
