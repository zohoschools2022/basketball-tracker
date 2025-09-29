'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatTimeRange } from '@/lib/utils'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'

interface SessionData {
  user: {
    id: string
    email: string
    name: string
    isAdmin: boolean
  }
  sessionToken: string
  expiresAt: number
}

interface Court {
  id: string
  name: string
  description: string
  timeSlots: TimeSlot[]
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

export default function Dashboard() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })

  useEffect(() => {
    const sessionData = localStorage.getItem('basketball_session')
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData)
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          setSession(parsed)
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

  useEffect(() => {
    if (session) {
      fetchCourts()
    }
  }, [session])

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/courts')
      if (response.ok) {
        const data = await response.json()
        setCourts(data)
      }
    } catch (error) {
      console.error('Failed to fetch courts:', error)
    }
  }

  const handleBookSlot = async (timeSlotId: string) => {
    if (!session) return

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.sessionToken}`
        },
        body: JSON.stringify({
          timeSlotId,
          date: selectedDate,
        }),
      })

      if (response.ok) {
        alert('Court booked successfully!')
        // Refresh courts to update availability
        fetchCourts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to book slot')
      }
    } catch (error) {
      alert('Failed to book slot')
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('basketball_session')
    router.push('/auth/magic-link')
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
            <p className="text-gray-600 mt-1">Welcome, {session.user.name}</p>
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
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span>Select Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return tomorrow.toISOString().split('T')[0]
              })()}
              max={(() => {
                const maxDate = new Date()
                maxDate.setDate(maxDate.getDate() + 1)
                return maxDate.toISOString().split('T')[0]
              })()}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              You can book up to 24 hours in advance
            </p>
          </CardContent>
        </Card>

        {/* Available Courts */}
        {courts.map((court) => (
          <Card key={court.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span>{court.name}</span>
              </CardTitle>
              <CardDescription>{court.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {court.timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {formatTimeRange(slot.startTime, slot.endTime)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleBookSlot(slot.id)}
                      size="sm"
                      className="px-4"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* User Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800">✅ Signed In</h3>
              <p className="text-green-600 text-sm mt-1">
                {session.user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}