import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string
      studentId?: string
    } & DefaultSession['user']
  }
  interface User {
    role?: string
    studentId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    studentId?: string
  }
}

const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      // Try Student model first (for student login)
      const student = await prisma.student.findUnique({
        where: { email: credentials.email }
      })

      if (student && student.status === 'ACTIVE') {
        const valid = await bcrypt.compare(credentials.password, student.password)
        if (valid) {
          return {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            email: student.email,
            role: 'STUDENT',
            studentId: student.id
          }
        }
      }

      // Fallback to User model (for admin login)
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })
      if (!user || !user.password) return null

      const valid = await bcrypt.compare(credentials.password, user.password)
      if (!valid) return null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'STUDENT'
      }
    }
  })
]

// Add Google Provider only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  )
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/fr/auth/login',
    signUp: '/fr/auth/register',
    error: '/fr/auth/error',
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session?.user && token) {
        session.user.role = token.role
        session.user.studentId = token.studentId
      }
      return session
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
      }
      return token
    },
    async redirect({ url, baseUrl, user }: any) {
      // Si un callbackUrl est spécifié (par exemple depuis le middleware)
      // et que c'est une URL relative valide, l'utiliser
      if (url.startsWith('/')) {
        // Vérifier que l'URL n'est pas une route d'authentification
        if (!url.includes('/auth/')) {
          return `${baseUrl}${url}`
        }
      }

      // Si c'est une URL absolue valide du même domaine
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Par défaut, rediriger vers l'espace étudiant ou la page d'accueil
      if (user?.role === 'STUDENT') {
        return `${baseUrl}/student/dashboard`
      }

      if (user?.role === 'ADMIN') {
        return `${baseUrl}/admin`
      }

      return baseUrl
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
