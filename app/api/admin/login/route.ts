import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminByUsername, updateLastLogin } from '@/lib/admin-db'
import { createAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const user = await getAdminByUsername(username.toLowerCase().trim())

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // bcryptjs handles both $2y$ (PHP) and $2b$ (Node) prefixes
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create JWT
    const token = await createAdminToken({
      userId:   user.id,
      username: user.username,
      role:     user.role,
      officeId: user.office_id,
    })

    // Update last login (fire-and-forget)
    updateLastLogin(user.id).catch(() => {})

    const response = NextResponse.json({
      ok:       true,
      username: user.username,
      role:     user.role,
    })

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   8 * 60 * 60, // 8 hours
    })

    return response
  } catch (err) {
    console.error('[admin/login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
