'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Loader } from 'lucide-react'

export default function VerifyMagicLink() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setError('Invalid magic link - no token found')
      return
    }

    verifyToken(token)
  }, [searchParams])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setUserInfo(data.user)
        
        // Store session
        localStorage.setItem('basketball_session', JSON.stringify({
          user: data.user,
          sessionToken: data.sessionToken,
          timestamp: Date.now()
        }))

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setError(data.error || 'Invalid or expired magic link')
      }
    } catch (err) {
      setStatus('error')
      setError('Failed to verify magic link')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            {status === 'loading' && <Loader className="w-8 h-8 text-orange-600 animate-spin" />}
            {status === 'success' && <Check className="w-8 h-8 text-green-600" />}
            {status === 'error' && <X className="w-8 h-8 text-red-600" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Verifying...'}
              {status === 'success' && 'Welcome!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {status === 'loading' && 'Please wait while we verify your magic link'}
              {status === 'success' && 'You have been successfully signed in'}
              {status === 'error' && 'There was a problem with your magic link'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && userInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800">✅ Authentication Successful</h3>
              <p className="text-green-600 text-sm mt-1">
                Welcome, {userInfo.name}!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
              <Button
                onClick={() => router.push('/auth/magic-link')}
                className="w-full"
              >
                Request New Magic Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}