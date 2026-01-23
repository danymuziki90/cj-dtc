
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.NEXTAUTH_SECRET || 'super-secret-dev-key-change-this'
const key = new TextEncoder().encode(secretKey)

export async function signJWT(payload: any, expiresIn: string = '24h') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key)
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}
