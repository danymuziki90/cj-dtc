import { NextRequest, NextResponse } from 'next/server'
import { downloadFromR2, getMimeTypeFromKey, sanitizeR2Key } from '@/lib/r2'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params
    if (!key || key.length === 0) {
      return NextResponse.json({ error: 'Clé de fichier requise' }, { status: 400 })
    }

    const rawKey = key.join('/')
    const r2Key = sanitizeR2Key(rawKey)
    if (!r2Key) {
      return NextResponse.json({ error: 'Clé de fichier invalide' }, { status: 400 })
    }

    const fileBuffer = await downloadFromR2(r2Key)
    const contentType = getMimeTypeFromKey(r2Key)
    const originalFileName = r2Key.split('/').pop() || 'document'
    const safeFileName = originalFileName.replace(/["\\]/g, '_')

    // Determine inline vs attachment disposition
    const isInlineType =
      contentType.startsWith('image/') ||
      contentType === 'application/pdf' ||
      contentType.startsWith('video/')
    const reqDisposition = request.nextUrl.searchParams.get('disposition')
    const dispositionType = reqDisposition === 'inline' || (isInlineType && reqDisposition !== 'attachment')
      ? 'inline'
      : 'attachment'

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileBuffer.length),
        'Content-Disposition': `${dispositionType}; filename="${safeFileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('[R2 File Service Error]:', error)
    return NextResponse.json({ error: 'Fichier introuvable ou indisponible' }, { status: 404 })
  }
}
