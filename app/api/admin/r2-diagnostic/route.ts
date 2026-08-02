import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/r2-diagnostic
 * Vérifie la configuration Cloudflare R2 complète :
 * - Variables d'environnement présentes
 * - Connexion au bucket
 * - Écriture, lecture, suppression d'un fichier test
 * - URL publique accessible
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const accountId     = process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim()   || process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId   = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim() || process.env.R2_ACCESS_KEY_ID?.trim()
  const secretKey     = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim() || process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucketName    = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim()   || process.env.R2_BUCKET_NAME?.trim()   || 'cjdevelopmenttc-storage'
  const publicUrl     = process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim()    || process.env.R2_PUBLIC_URL?.trim()    || ''

  const envCheck = {
    CLOUDFLARE_R2_ACCOUNT_ID:         { present: Boolean(accountId),   value: accountId   ? `${accountId.slice(0, 6)}...` : 'ABSENT' },
    CLOUDFLARE_R2_ACCESS_KEY_ID:      { present: Boolean(accessKeyId), value: accessKeyId ? `${accessKeyId.slice(0, 6)}...` : 'ABSENT' },
    CLOUDFLARE_R2_SECRET_ACCESS_KEY:  { present: Boolean(secretKey),   value: secretKey   ? '***masqué***' : 'ABSENT' },
    CLOUDFLARE_R2_BUCKET_NAME:        { present: Boolean(bucketName),  value: bucketName  || 'ABSENT' },
    CLOUDFLARE_R2_PUBLIC_URL:         { present: Boolean(publicUrl),   value: publicUrl   || 'ABSENT (fallback /api/r2/file/ utilisé)' },
  }

  const isConfigured = Boolean(accountId && accessKeyId && secretKey)
  const results: Record<string, any> = { envCheck, isConfigured }

  if (!isConfigured) {
    results.error = 'Configuration R2 incomplète — certaines variables sont manquantes.'
    results.recommendation = 'Ajoutez CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID et CLOUDFLARE_R2_SECRET_ACCESS_KEY dans les variables Vercel.'
    return NextResponse.json(results, { status: 200 })
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretKey! },
  })

  // 1. Test de connexion au bucket
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }))
    results.bucketAccess = { ok: true, message: `Bucket '${bucketName}' accessible.` }
  } catch (err: any) {
    results.bucketAccess = { ok: false, message: `Impossible d'accéder au bucket '${bucketName}': ${err?.message || err}` }
    results.recommendation = 'Vérifiez que le nom du bucket et les clés d\'accès sont corrects dans Cloudflare R2.'
    return NextResponse.json(results, { status: 200 })
  }

  // 2. Test d'écriture
  const testKey = `diagnostic/test-${Date.now()}.txt`
  const testContent = `CJ-DTC R2 diagnostic test — ${new Date().toISOString()}`
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    }))
    results.writeTest = { ok: true, key: testKey, message: 'Écriture réussie.' }
  } catch (err: any) {
    results.writeTest = { ok: false, message: `Écriture échouée: ${err?.message || err}` }
    return NextResponse.json(results, { status: 200 })
  }

  // 3. Test de lecture
  try {
    const getResp = await client.send(new GetObjectCommand({ Bucket: bucketName, Key: testKey }))
    const body = await getResp.Body?.transformToString()
    results.readTest = { ok: body === testContent, message: body === testContent ? 'Lecture réussie — contenu correct.' : `Contenu inattendu: "${body}"` }
  } catch (err: any) {
    results.readTest = { ok: false, message: `Lecture échouée: ${err?.message || err}` }
  }

  // 4. Test de l'URL publique
  if (publicUrl) {
    const testPublicUrl = `${publicUrl.replace(/\/$/, '')}/${testKey}`
    try {
      const fetchResp = await fetch(testPublicUrl, { method: 'HEAD' })
      results.publicUrlTest = {
        ok: fetchResp.ok,
        url: testPublicUrl,
        status: fetchResp.status,
        message: fetchResp.ok
          ? 'URL publique accessible ✅'
          : `URL publique retourne HTTP ${fetchResp.status} — vérifiez que l\'accès public est activé sur le bucket R2.`,
      }
    } catch (err: any) {
      results.publicUrlTest = {
        ok: false,
        url: testPublicUrl,
        message: `Impossible de joindre l'URL publique: ${err?.message || err}`,
      }
    }
  } else {
    results.publicUrlTest = {
      ok: null,
      message: 'CLOUDFLARE_R2_PUBLIC_URL non défini — les fichiers seront servis via /api/r2/file/ (proxy interne). Fonctionnel mais moins performant.',
    }
  }

  // 5. Test de suppression (nettoyage)
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: testKey }))
    results.deleteTest = { ok: true, message: 'Suppression réussie — nettoyage effectué.' }
  } catch (err: any) {
    results.deleteTest = { ok: false, message: `Suppression échouée: ${err?.message || err}` }
  }

  // 6. Liste des 5 derniers fichiers dans travaux/remises
  try {
    const listResp = await client.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'travaux/remises/',
      MaxKeys: 5,
    }))
    results.recentUploads = {
      count: listResp.KeyCount ?? 0,
      files: (listResp.Contents || []).map(f => ({
        key: f.Key,
        size: f.Size,
        lastModified: f.LastModified,
      })),
      message: `${listResp.KeyCount ?? 0} fichier(s) trouvé(s) dans travaux/remises/`,
    }
  } catch (err: any) {
    results.recentUploads = { ok: false, message: `Listage échoué: ${err?.message || err}` }
  }

  // Résumé global
  const allOk = results.bucketAccess?.ok && results.writeTest?.ok && results.readTest?.ok
  results.summary = {
    status: allOk ? '✅ R2 opérationnel' : '❌ R2 partiellement défaillant',
    bucketName,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicUrl: publicUrl || 'Non défini (proxy /api/r2/file/ utilisé)',
  }

  return NextResponse.json(results)
}
