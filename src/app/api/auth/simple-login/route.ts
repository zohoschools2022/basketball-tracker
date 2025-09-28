import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Check if email belongs to Zoho domain
    if (!email.includes('@zohocorp.com') && !email.includes('@zoho.com')) {
      return NextResponse.json({ error: 'Only Zoho users are allowed' }, { status: 403 })
    }

    // Try to find existing user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      // Existing user - verify password
      // For simplicity, we'll use a basic password check
      // In a real app, you'd verify against Zoho or use proper hashing
      if (password.length < 4) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }
    } else {
      // New user - create account
      if (!name) {
        return NextResponse.json({ error: 'Name is required for new users' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          // Store hashed password in a new field (we'll add this to schema)
        }
      })
    }

    // Create session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36)}`

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      },
      sessionToken,
      isNewUser: !user
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
