import { NextRequest, NextResponse } from 'next/server'
import { downloadFromR2 } from '@/lib/r2'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params
    if (!key || key.length === 0) {
      return NextResponse.json({ error: 'Clé requise' }, { status: 400 })
    }
    
    const r2Key = key.join('/')
    const fileBuffer = await downloadFromR2(r2Key)
    
    const ext = r2Key.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'pdf') contentType = 'application/pdf'
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Erreur de service du fichier R2:', error)
    return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
  }
}
