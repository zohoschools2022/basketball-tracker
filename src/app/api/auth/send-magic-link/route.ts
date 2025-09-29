import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedEmail, generateMagicToken } from '@/lib/auth'
import { sendMagicLink } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email domain
    if (!isAuthorizedEmail(email)) {
      return NextResponse.json(
        { error: 'Only @zohocorp.com and @zoho.com emails are allowed' },
        { status: 403 }
      )
    }

    // Generate magic token
    const magicToken = generateMagicToken(email)

    // Send magic link via email
    const emailResult = await sendMagicLink(email, magicToken)

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Magic link sent to your email',
        magicLink: emailResult.magicLink // For demo purposes
      })
    } else {
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Send magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}