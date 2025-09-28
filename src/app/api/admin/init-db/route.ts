import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect()

    // Create courts
    const schoolCourt = await prisma.court.upsert({
      where: { name: 'School Court' },
      update: {},
      create: {
        name: 'School Court',
        description: 'Basketball court at the school premises',
      },
    })

    const officeCourt = await prisma.court.upsert({
      where: { name: 'Office Court' },
      update: {},
      create: {
        name: 'Office Court',
        description: 'Basketball court at the office premises',
      },
    })

    // Create time slots for School Court
    const schoolSlots = [
      { startTime: '06:00', endTime: '08:00' },
      { startTime: '17:30', endTime: '19:30' },
      { startTime: '19:30', endTime: '21:30' },
    ]

    for (const slot of schoolSlots) {
      await prisma.timeSlot.upsert({
        where: {
          id: `${schoolCourt.id}-${slot.startTime}-${slot.endTime}`,
        },
        update: {},
        create: {
          courtId: schoolCourt.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      })
    }

    // Create time slots for Office Court
    const officeSlots = [
      { startTime: '06:00', endTime: '07:30' },
      { startTime: '07:30', endTime: '09:00' },
      { startTime: '17:00', endTime: '18:30' },
      { startTime: '18:30', endTime: '20:00' },
      { startTime: '20:00', endTime: '21:30' },
    ]

    for (const slot of officeSlots) {
      await prisma.timeSlot.upsert({
        where: {
          id: `${officeCourt.id}-${slot.startTime}-${slot.endTime}`,
        },
        update: {},
        create: {
          courtId: officeCourt.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      courts: 2,
      schoolSlots: schoolSlots.length,
      officeSlots: officeSlots.length,
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
