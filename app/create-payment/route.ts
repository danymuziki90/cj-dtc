import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSessionPayment, createSessionPaymentSchema } from '@/lib/payments/session-payment'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = createSessionPaymentSchema.parse(await request.json())
    const result = await createSessionPayment(payload)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error('Create payment error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid payload', details: error.flatten() },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create payment.' }, { status: 500 })
  }
}
