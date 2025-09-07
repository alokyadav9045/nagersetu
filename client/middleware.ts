import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Since we're using localStorage, we can't check it in middleware
    // We'll handle this in the admin layout component instead
    // This middleware mainly serves as a backup and for logging
    
    console.log('Admin route accessed:', pathname)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
