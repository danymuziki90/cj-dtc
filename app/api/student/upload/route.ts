import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-portal/guards'
import { uploadToR2 } from '@/lib/r2'

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const student = auth.student

  try {
    const formData = await request.formData()
    const file: File | null = formData.get('file') as unknown as File
    const assignmentIdVal = formData.get('assignmentId')
    const maxFileSizeMbVal = formData.get('maxFileSize')

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const maxFileSizeMb = maxFileSizeMbVal ? parseFloat(String(maxFileSizeMbVal)) : 10
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
    const storageKeyName = `${student.id}_${assignmentIdVal || 'travail'}_${timestamp}_${sanitizedOriginalName}`
    const r2Folder = 'travaux/remises'

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'application/octet-stream'

    const fileUrl = await uploadToR2(buffer, storageKeyName, r2Folder, mimeType)

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
    console.error('[Student File Upload POST Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors du téléversement du fichier.' },
      { status: 500 }
    )
  }
}
