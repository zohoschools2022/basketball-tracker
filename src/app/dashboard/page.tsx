'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SessionData {
  user: {
    id: string
    email: string
    name: string
    isAdmin: boolean
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionData = localStorage.getItem('basketball_session')
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData)
        setSession(parsed)
      } catch {
        localStorage.removeItem('basketball_session')
        router.push('/auth/simple')
      }
    } else {
      router.push('/auth/simple')
    }
    
    setLoading(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('basketball_session')
    router.push('/auth/simple')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Basketball Courts</h1>
            <p className="text-gray-600 mt-1">Welcome, {session.user?.name}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏀</span>
              <span>Basketball Court Tracker</span>
            </CardTitle>
            <CardDescription>
              Your Zoho authentication is working! Court booking system coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">✅ Authentication Success</h3>
                <p className="text-green-600 text-sm mt-1">
                  Logged in as: {session.user.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Coming Soon:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Court booking system</li>
                  <li>• Game score tracking</li>
                  <li>• Admin dashboard</li>
                  <li>• Penalty management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}