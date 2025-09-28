import { prisma } from './prisma'
import nodemailer from 'nodemailer'

// Create email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendMagicLink(email: string) {
  try {
    // Validate Zoho email
    if (!email.includes('@zohocorp.com') && !email.includes('@zoho.com')) {
      throw new Error('Only Zoho emails are allowed')
    }

    // Generate magic token
    const token = generateSecureToken()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: token,
        expires: expires,
      },
    })

    // Create magic link
    const magicLink = `${process.env.NEXTAUTH_URL || 'https://basketball-tracker-production.up.railway.app'}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Basketball Tracker <noreply@basketball-tracker.com>',
      to: email,
      subject: '🏀 Basketball Court Tracker - Sign In Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">🏀 Basketball Court Tracker</h2>
          <p>Hi there!</p>
          <p>Click the link below to sign in to your basketball court booking account:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" 
               style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Sign In to Basketball Tracker
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes for security.<br/>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Magic link error:', error)
    throw error
  }
}

export async function verifyMagicLink(token: string, email: string) {
  try {
    // Find valid token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
        expires: {
          gt: new Date(), // Not expired
        },
      },
    })

    if (!verificationToken) {
      throw new Error('Invalid or expired token')
    }

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    })

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: { 
        updatedAt: new Date(),
        isActive: true,
      },
      create: {
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        isActive: true,
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Verification error:', error)
    throw error
  }
}

function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
