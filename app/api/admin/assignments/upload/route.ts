import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.csv'
])

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const data = await request.formData()
    const file = data.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Format de fichier non autorisé.' }, { status: 400 })
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 20 Mo).' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'assignments')
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const filePath = join(uploadDir, fileName)
    
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    const fileUrl = `/uploads/assignments/${fileName}`

    return NextResponse.json({
      url: fileUrl,
      name: fileName,
      originalName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error('Admin assignment file upload error:', error)
    return NextResponse.json({ error: 'Erreur lors du téléversement.' }, { status: 500 })
  }
}
