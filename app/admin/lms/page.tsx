import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function LMSPage(){
  let cfg = null
  
  try {
    cfg = await prisma.lMSConfig.findFirst()
  } catch (error: any) {
    console.error('Erreur de connexion à la base de données:', error.message)
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-cjblue">Configuration LMS</h2>
      {cfg ? (
        <div className="mt-4 p-4 border rounded">
          <p>Provider: {cfg.provider}</p>
          <p>API URL: {cfg.apiUrl}</p>
          <p>API Key: <code>{cfg.apiKey}</code></p>
        </div>
      ) : (
        <div className="mt-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">Aucune configuration LMS trouvée ou erreur de connexion à la base de données.</p>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-600">Pour connecter Moodle/TalentLMS/Google Classroom, remplacez les clés API dans la configuration.</p>
    </div>
  )
}
