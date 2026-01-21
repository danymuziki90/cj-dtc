import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, dateOfBirth, address, city, country, role } = await req.json()

    // Validation basique
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Un compte avec cet email existe déjà' }, { status: 409 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: role || 'student'
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Compte créé avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
