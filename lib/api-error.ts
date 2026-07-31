import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

type AppRouteHandler = (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse

export function apiHandler(handler: AppRouteHandler) {
  return async (req: NextRequest, context: any) => {
    try {
      return await handler(req, context)
    } catch (error: any) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error)
      
      if (error instanceof ZodError) {
        return NextResponse.json({
          error: error.issues[0]?.message || 'Données invalides',
          details: error.errors
        }, { status: 400 })
      }
      
      if (error instanceof ApiError) {
        return NextResponse.json({
          error: error.message,
          ...(error.details ? { details: error.details } : {})
        }, { status: error.statusCode })
      }
      
      if (error?.code === 'P2002') {
        return NextResponse.json({
          error: 'Une ressource avec cet identifiant unique existe déjà.'
        }, { status: 409 })
      }
      
      // Fallback for unexpected errors
      return NextResponse.json({
        error: 'Erreur serveur interne'
      }, { status: 500 })
    }
  }
}
