import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'admin@nagarsetu.gov.in'
const ADMIN_PASSWORD = 'Nagarsetu@Admin2025'

function base64UrlEncode(obj: any) {
  const json = JSON.stringify(obj)
  return Buffer.from(json).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const header = { alg: 'none', typ: 'JWT' }
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24h
    const payload = { sub: email, role: 'admin', exp }

    const token = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`

    const res = NextResponse.json({ ok: true })
    res.cookies.set('adminToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production'
    })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}
