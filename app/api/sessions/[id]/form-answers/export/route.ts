import { NextRequest, NextResponse } from 'next/server'

/**
 * Backward-compatible route. The central enrollment export now owns the
 * session-aware Excel generation so every admin export follows one rule.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const url = new URL('/api/enrollments/export', req.url)
  url.searchParams.set('format', 'excel')
  url.searchParams.set('sessionId', id)
  return NextResponse.redirect(url)
}
