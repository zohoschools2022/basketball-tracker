import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate Zoho email
    if (!email.includes('@zohocorp.com') && !email.includes('@zoho.com')) {
      return NextResponse.json({ error: 'Only Zoho emails are allowed' }, { status: 403 })
    }

    // Generate test token
    const token = `test_${Date.now()}_${Math.random().toString(36)}`
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires: expires,
      },
    })

    // Return magic link for testing (normally this would be sent via email)
    const magicLink = `https://basketball-tracker-production.up.railway.app/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

    return NextResponse.json({
      success: true,
      message: 'Magic link generated (normally sent via email)',
      magicLink: magicLink,
      testInstructions: 'Copy and paste this link in your browser to sign in'
    })

  } catch (error) {
    console.error('Test magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to generate magic link' },
      { status: 500 }
    )
  }
}
