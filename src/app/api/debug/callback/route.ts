import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Check if we can connect to database
    await prisma.$connect()
    
    // Test creating a user (this is what NextAuth does)
    const testUser = await prisma.user.findFirst()
    
    return NextResponse.json({
      callbackReceived: true,
      hasCode: !!code,
      hasError: !!error,
      error: error,
      databaseConnected: true,
      canQueryUsers: !!testUser || 'no_users_yet',
      timestamp: new Date().toISOString()
    })

  } catch (dbError) {
    return NextResponse.json({
      callbackReceived: true,
      databaseConnected: false,
      error: dbError instanceof Error ? dbError.message : 'Database error',
      timestamp: new Date().toISOString()
    })
  }
}
