'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface StudentAuthState {
  isLoggedIn: boolean
  isLoading: boolean
}

const StudentAuthContext = createContext<StudentAuthState>({
  isLoggedIn: false,
  isLoading: true,
})

export function useStudentAuth() {
  return useContext(StudentAuthContext)
}

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudentAuthState>({
    isLoggedIn: false,
    isLoading: true,
  })

  useEffect(() => {
    let alive = true
    fetch('/api/student/auth/me')
      .then(res => {
        if (alive) setState({ isLoggedIn: res.ok, isLoading: false })
      })
      .catch(() => {
        if (alive) setState({ isLoggedIn: false, isLoading: false })
      })
    return () => { alive = false }
  }, [])

  return (
    <StudentAuthContext.Provider value={state}>
      {children}
    </StudentAuthContext.Provider>
  )
}
