import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { extname, join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireStudent } from '@/lib/auth-portal/guards'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.txt', '.zip'])
const MAX_FILE_SIZE = 15 * 1024 * 1024

export async function GET(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  const submissions = await prisma.studentSubmission.findMany({
    where: { studentId: auth.student.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ submissions })
}

export async function POST(request: NextRequest) {
  const auth = await requireStudent(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const title = (formData.get('title') as string | null)?.trim()
    const file = formData.get('file') as File | null

    if (!title || title.length < 3) {
      return NextResponse.json({ error: 'Title is required (min 3 characters).' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 15MB).' }, { status: 400 })
    }

    const extension = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'student-submissions', auth.student.id)
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${randomUUID()}${extension}`
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/uploads/student-submissions/${auth.student.id}/${fileName}`
    const submission = await prisma.studentSubmission.create({
      data: {
        studentId: auth.student.id,
        sessionId: auth.student.adminSessionId ?? null,
        title,
        fileUrl,
        status: 'pending',
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('Student submission upload error:', error)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
