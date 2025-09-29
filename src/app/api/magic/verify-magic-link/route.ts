import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken, generateSessionToken, createOrUpdateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify the magic token
    const tokenData = verifyMagicToken(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 401 }
      )
    }

    // Create or update user in database
    const user = await createOrUpdateUser(tokenData.email)

    // Generate session token
    const sessionToken = generateSessionToken(user.id)

    return NextResponse.json({
      success: true,
      message: 'Magic link verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      sessionToken
    })

  } catch (error) {
    console.error('Verify magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to verify magic link' },
      { status: 500 }
    )
  }
}