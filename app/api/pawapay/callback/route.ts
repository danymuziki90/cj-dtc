import { NextRequest } from 'next/server'
import { handlePawaPayCallback } from '@/lib/payments/pawapay-callback'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  return handlePawaPayCallback(request)
}
