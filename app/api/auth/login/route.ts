
import { NextResponse } from 'next/server'
import { authOptions } from '../../../../../lib/auth'
import { getServerSession } from 'next-auth'

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // For NextAuth, we redirect to the sign-in endpoint
    // The actual authentication will be handled by NextAuth
    return NextResponse.json({
      success: true,
      message: 'Redirection vers NextAuth...',
      redirectTo: '/api/auth/signin'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
