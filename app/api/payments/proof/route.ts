import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB

function getExtension(fileName: string, mimeType: string) {
  const fallback = mimeType === 'application/pdf' ? 'pdf' : 'bin'
  const parts = fileName.split('.')
  if (parts.length < 2) return fallback
  return parts[parts.length - 1].toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, PDF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum is 8MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment-proofs')
    await mkdir(uploadDir, { recursive: true })

    const extension = getExtension(file.name, file.type)
    const fileName = `${randomUUID()}.${extension}`
    const filePath = join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/payment-proofs/${fileName}`,
      fileName,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('Payment proof upload error:', error)
    return NextResponse.json({ error: 'Unable to upload payment proof.' }, { status: 500 })
  }
}
