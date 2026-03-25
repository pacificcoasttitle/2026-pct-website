import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TESSA_COOKIE, createSessionValue, isAuthRequired } from '@/lib/tessa-auth'

export async function POST(req: Request) {
  if (!isAuthRequired()) {
    return NextResponse.json({ success: true })
  }

  const { code } = await req.json()

  if (code !== process.env.TESSA_ACCESS_CODE) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
  }

  const jar = await cookies()
  jar.set(TESSA_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  })

  return NextResponse.json({ success: true })
}
