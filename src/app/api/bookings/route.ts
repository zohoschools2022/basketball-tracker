import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySessionToken } from '@/lib/auth'
import { isValidBookingTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { timeSlotId, date, gameType } = await request.json()
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const sessionData = verifySessionToken(token)

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (!timeSlotId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate booking time (must be between 1-24 hours in advance)
    const bookingDate = new Date(date)
    if (!isValidBookingTime(bookingDate)) {
      return NextResponse.json(
        { error: 'Bookings must be made 1-24 hours in advance' },
        { status: 400 }
      )
    }

    // Get time slot to find court
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { court: true }
    })

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Invalid time slot' },
        { status: 400 }
      )
    }

    // Check if slot is already booked
    const existingBooking = await prisma.booking.findUnique({
      where: {
        courtId_timeSlotId_date: {
          courtId: timeSlot.courtId,
          timeSlotId,
          date: bookingDate
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: sessionData.userId,
        courtId: timeSlot.courtId,
        timeSlotId,
        date: bookingDate,
        gameType: gameType || null
      },
      include: {
        timeSlot: {
          include: { court: true }
        }
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
