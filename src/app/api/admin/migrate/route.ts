import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Run Prisma DB push to create the proper schema
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset', {
      env: { ...process.env }
    })

    console.log('Prisma DB Push Output:', stdout)
    if (stderr) console.error('Prisma DB Push Errors:', stderr)

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully with Prisma!',
      output: stdout,
      errors: stderr || null
    })

  } catch (error) {
    console.error('Database migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
