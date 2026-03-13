declare module 'next-auth/jwt' {
  export function getToken(params: any): Promise<any>
}

declare module 'next-auth/react' {
  export function useSession(): { data: any; status: 'loading' | 'authenticated' | 'unauthenticated' }
  export function signIn(provider?: string, options?: any, authorizationParams?: any): Promise<any>
  export function signOut(options?: any): Promise<any>
  export const SessionProvider: any
}
