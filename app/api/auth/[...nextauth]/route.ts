import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = "nodejs"

declare module 'next-auth' {
  interface Session {
    user: {
      role?: string
    } & DefaultSession['user']
  }
  interface User {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}

const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label:'Email', type:'text' },
      password: { label:'Password', type:'password' }
    },
    async authorize(credentials){
      if(!credentials) return null
      const user = await prisma.user.findUnique({ where:{email:credentials.email} })
      if(!user || !user.password) return null
      const valid = await bcrypt.compare(credentials.password, user.password)
      if(!valid) return null
      return { id:user.id, name:user.name, email:user.email, role:user.role }
    }
  })
]

// Ajouter Google Provider seulement si les credentials sont configurés
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
  callbacks:{
    async session({session, token}: any){
      if(session.user && token.role) {
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }: any){
      if(user && user.role) {
        token.role = user.role
      }
      return token
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
