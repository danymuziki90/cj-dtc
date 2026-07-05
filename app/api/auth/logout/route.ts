
import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export const runtime = "nodejs"

export async function POST() {
    const serializedCookie = serialize('student-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
    })

    return new NextResponse(
        JSON.stringify({ success: true }),
        {
            status: 200,
            headers: {
                'Set-Cookie': serializedCookie,
                'Content-Type': 'application/json'
            }
        }
    )
}
