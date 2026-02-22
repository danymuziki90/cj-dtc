import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

export const runtime = "nodejs"

// Réexporter pour les API qui importent authOptions depuis cette route
export { authOptions }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
