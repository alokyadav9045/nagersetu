import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return false
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = payloadB64.length % 4
    const padded = pad ? payloadB64 + '='.repeat(4 - pad) : payloadB64
    const json = atob(padded)
    const payload = JSON.parse(json) as { exp?: number }
    if (!payload.exp) return false
    const now = Math.floor(Date.now() / 1000)
    return payload.exp > now
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loginPath = '/admin/login'

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const adminToken = request.cookies.get('adminToken')?.value
  const valid = adminToken ? isTokenValid(adminToken) : false

  // If already authenticated, redirect login page to admin home
  if (pathname === loginPath) {
    if (valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // For all other /admin routes, require valid token
  if (!valid) {
    const url = request.nextUrl.clone()
    url.pathname = loginPath
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
