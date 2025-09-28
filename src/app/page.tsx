'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for magic link session
    const sessionData = localStorage.getItem('basketball_session')
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        // Check if session is still valid
        if (session.expiresAt && session.expiresAt > Date.now()) {
          router.push('/dashboard')
        } else {
          localStorage.removeItem('basketball_session')
          router.push('/auth/magic-link')
        }
      } catch {
        localStorage.removeItem('basketball_session')
        router.push('/auth/magic-link')
      }
    } else {
      router.push('/auth/magic-link')
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return null
}