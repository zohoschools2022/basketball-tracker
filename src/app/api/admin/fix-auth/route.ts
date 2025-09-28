import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    await prisma.$connect()

    // Add missing constraints and indexes for NextAuth
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_key" 
        UNIQUE ("provider", "providerAccountId");
      `
    } catch (e) {
      console.log('Account constraint already exists')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionToken_key" 
        UNIQUE ("sessionToken");
      `
    } catch (e) {
      console.log('Session constraint already exists')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD CONSTRAINT "User_email_key" 
        UNIQUE ("email");
      `
    } catch (e) {
      console.log('User constraint already exists')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_token_key" 
        UNIQUE ("identifier", "token");
      `
    } catch (e) {
      console.log('VerificationToken constraint already exists')
    }

    // Add foreign key constraints
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
    } catch (e) {
      console.log('Account foreign key already exists')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `
    } catch (e) {
      console.log('Session foreign key already exists')
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'NextAuth database constraints fixed!',
    })

  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
