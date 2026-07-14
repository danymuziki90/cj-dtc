import { NextRequest } from 'next/server'
import { POST as handlePost } from '../route'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  return handlePost(request)
}
