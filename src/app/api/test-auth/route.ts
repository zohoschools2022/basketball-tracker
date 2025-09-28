import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    searchParams: Object.fromEntries(searchParams),
    headers: Object.fromEntries(request.headers),
    url: request.url,
    envVars: {
      hasZohoClientId: !!process.env.ZOHO_CLIENT_ID,
      hasZohoSecret: !!process.env.ZOHO_CLIENT_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      zohoClientIdPrefix: process.env.ZOHO_CLIENT_ID?.substring(0, 8) + '...',
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }
  })
}
