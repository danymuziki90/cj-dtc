import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/auth'
import { uploadToR2 } from '@/lib/r2'

export const runtime = 'nodejs'
const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export async function POST(request: NextRequest) {
  if (!(await verifyAdminToken(request)).admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const file = (await request.formData()).get('file') as File | null
  if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image JPG, PNG, WebP ou AVIF (5 Mo max) requise.' }, { status: 400 })
  const extension = file.name.split('.').pop() || 'jpg'
  const imageUrl = await uploadToR2(Buffer.from(await file.arrayBuffer()), `director-welcome-${Date.now()}.${extension}`, 'director-welcome', file.type)
  return NextResponse.json({ imageUrl })
}
