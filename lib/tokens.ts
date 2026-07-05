
import { prisma } from './prisma'
import { v4 as uuidv4 } from 'uuid'

export async function generateVerificationToken(email: string) {
    const token = uuidv4()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

    // Check if a token already exists for this email
    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email }
    })

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token
                }
            }
        })
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    })

    return verificationToken
}
