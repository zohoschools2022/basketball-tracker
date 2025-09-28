import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await sendMagicLink(email)

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully'
    })

  } catch (error) {
    console.error('Send magic link error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send magic link' },
      { status: 500 }
    )
  }
}
