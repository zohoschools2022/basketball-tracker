'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, Check } from 'lucide-react'

export default function MagicLinkAuth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [magicLink, setMagicLink] = useState('') // For demo purposes

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/magic/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
        setMagicLink(data.magicLink) // For demo - in production this would be sent via email
      } else {
        setError(data.error || 'Failed to send magic link')
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            {sent ? (
              <Check className="w-8 h-8 text-green-600" />
            ) : (
              <Mail className="w-8 h-8 text-orange-600" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {sent ? 'Check Your Email' : 'Basketball Court Tracker'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {sent 
                ? 'We sent you a magic link to sign in'
                : 'Enter your Zoho email to get a magic link'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!sent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Zoho Email Address
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

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Send Magic Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">✅ Magic Link Sent</h3>
                <p className="text-green-600 text-sm mt-1">
                  Check your email: {email}
                </p>
              </div>

              {/* Demo purposes - show the magic link */}
              {magicLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800">🔗 Demo Magic Link</h4>
                  <p className="text-blue-600 text-xs mt-1">
                    In production, this would be sent via email:
                  </p>
                  <a 
                    href={magicLink}
                    className="block mt-2 p-2 bg-blue-100 rounded text-xs break-all text-blue-700 hover:bg-blue-200"
                  >
                    Click here to sign in
                  </a>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                  setMagicLink('')
                }}
                className="w-full"
              >
                Send to Different Email
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            Only @zohocorp.com and @zoho.com emails are allowed
          </div>
        </CardContent>
      </Card>
    </div>
  )
}