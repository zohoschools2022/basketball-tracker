import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'basketball-court-tracker-secret-key'
const AUTHORIZED_DOMAINS = ['@zohocorp.com', '@zoho.com']

export function isAuthorizedEmail(email: string): boolean {
  return AUTHORIZED_DOMAINS.some(domain => email.toLowerCase().endsWith(domain))
}

export function generateMagicToken(email: string): string {
  return jwt.sign(
    { 
      email, 
      purpose: 'magic-link',
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '15m' } // Token expires in 15 minutes
  )
}

export function verifyMagicToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.purpose === 'magic-link' && decoded.email) {
      return { email: decoded.email }
    }
    return null
  } catch {
    return null
  }
}

export function generateSessionToken(userId: string): string {
  return jwt.sign(
    { 
      userId,
      purpose: 'session',
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '30d' } // Session expires in 30 days
  )
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.purpose === 'session' && decoded.userId) {
      return { userId: decoded.userId }
    }
    return null
  } catch {
    return null
  }
}

export async function createOrUpdateUser(email: string, name?: string) {
  return await prisma.user.upsert({
    where: { email },
    update: { 
      name: name || undefined,
      updatedAt: new Date()
    },
    create: {
      email,
      name: name || email.split('@')[0], // Use email prefix as default name
    }
  })
}
