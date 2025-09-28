'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const AUTHORIZED_USERS = [
  { email: 'rajendran@zohocorp.com', name: 'Rajendran D', password: 'basketball2024' },
  { email: 'admin@zohocorp.com', name: 'Admin User', password: 'admin2024' },
  // Add more authorized users here
]

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check against authorized users
      const user = AUTHORIZED_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      )

      if (user) {
        // Create session
        const sessionData = {
          user: {
            id: `user_${Date.now()}`,
            email: user.email,
            name: user.name,
            isAdmin: user.email.includes('admin')
          },
          sessionToken: `session_${Date.now()}_${Math.random().toString(36)}`
        }

        localStorage.setItem('basketball_session', JSON.stringify(sessionData))
        router.push('/dashboard')
      } else {
        setError('Invalid credentials or unauthorized user')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            🏀
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Basketball Court Tracker</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in with your authorized Zoho credentials
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@zohocorp.com"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-4">
            <strong>Demo Credentials:</strong><br/>
            Email: rajendran@zohocorp.com<br/>
            Password: basketball2024
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
