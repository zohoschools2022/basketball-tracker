import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email belongs to Zoho domain (basic validation)
    if (!email.includes('@zohocorp.com') && !email.includes('@zoho.com')) {
      return NextResponse.json({ error: 'Only Zoho users are allowed' }, { status: 403 })
    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        name: name || undefined,
        updatedAt: new Date()
      },
      create: {
        email,
        name: name || undefined,
      }
    })

    // Create simple session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36)}`

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      sessionToken
    })

  } catch (error) {
    console.error('Simple login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
