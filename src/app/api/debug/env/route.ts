import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasZohoClientId: !!process.env.ZOHO_CLIENT_ID,
    hasZohoClientSecret: !!process.env.ZOHO_CLIENT_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    zohoClientIdPrefix: process.env.ZOHO_CLIENT_ID ? process.env.ZOHO_CLIENT_ID.substring(0, 6) + '...' : 'NOT_SET',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET'
  })
}
