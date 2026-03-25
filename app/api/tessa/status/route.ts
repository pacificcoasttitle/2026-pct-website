import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TESSA_COOKIE, isValidSession, isAuthRequired } from '@/lib/tessa-auth'

export async function GET() {
  if (!isAuthRequired()) {
    return NextResponse.json({ authenticated: true })
  }

  const jar = await cookies()
  const session = jar.get(TESSA_COOKIE)?.value
  return NextResponse.json({ authenticated: isValidSession(session) })
}
