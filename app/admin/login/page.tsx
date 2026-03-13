'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="mb-6 text-sm text-gray-500">Use your admin username and password</p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="admin username"
              data-testid="admin-login-username"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="password"
              data-testid="admin-login-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
            data-testid="admin-login-submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
