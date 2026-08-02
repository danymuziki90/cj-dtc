import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/lib/api-error'

export const GET = apiHandler(async () => {
  const faq = await prisma.fAQ.findMany({
    orderBy: [
      { category: 'asc' },
      { order: 'asc' }
    ]
  })
  return NextResponse.json(faq)
})
