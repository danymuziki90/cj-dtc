import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File
    const maxFileSizeMbVal = formData.get('maxFileSize')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const maxFileSizeMb = maxFileSizeMbVal ? parseFloat(String(maxFileSizeMbVal)) : 50
    const maxSizeBytes = maxFileSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `Le fichier "${file.name}" (${(file.size / 1024 / 1024).toFixed(1)} MB) dépasse la taille maximale autorisée de ${maxFileSizeMb} MB.`,
        },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storageKeyName = `admin_assignment_${timestamp}_${sanitizedOriginalName}`
    const r2Folder = 'travaux/consignes'

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'application/octet-stream'

    const fileUrl = await uploadToR2(buffer, storageKeyName, r2Folder, mimeType)

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Échec de la génération de l\'URL d\'accès au fichier téléversé.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        name: storageKeyName,
        originalName: file.name,
        size: file.size,
        mimeType: mimeType,
        url: fileUrl,
        key: `${r2Folder}/${storageKeyName}`,
      },
    })
  } catch (error: any) {
    console.error('[Admin File Upload POST Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors du téléversement du fichier.' },
      { status: 500 }
    )
  }
}
