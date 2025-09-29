import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      where: { isActive: true },
      include: {
        timeSlots: {
          where: { isActive: true },
          orderBy: { startTime: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(courts)
  } catch (error) {
    console.error('Failed to fetch courts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    )
  }
}
