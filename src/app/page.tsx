'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check for simple session
    const session = localStorage.getItem('basketball_session')
    
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/simple')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
}