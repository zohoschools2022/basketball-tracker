'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyMagicLink() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setStatus('error')
      setError('Invalid verification link')
      return
    }

    verifyToken(token, email)
  }, [searchParams])

  const verifyToken = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store session
        localStorage.setItem('basketball_session', JSON.stringify({
          user: data.user,
          sessionToken: `session_${Date.now()}_${Math.random().toString(36)}`,
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        }))

        setStatus('success')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setError(data.error || 'Verification failed')
      }
    } catch (err) {
      setStatus('error')
      setError('Verification failed. Please try again.')
    }
  }

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium">Verifying...</h3>
            <p className="text-gray-600 mt-2">Please wait while we verify your magic link</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              ✅
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
              <CardDescription className="text-gray-600">
                You're successfully signed in
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting you to the basketball court dashboard...
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            ❌
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
            <CardDescription className="text-gray-600">
              {error}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/auth/magic-link')} className="w-full">
            Request New Link
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
