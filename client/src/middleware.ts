import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })
  
  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (req.nextUrl.pathname === '/admin/login') {
      return response
    }

    // Check for admin authentication
    const adminToken = req.cookies.get('adminToken')?.value
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Verify admin token (basic check)
    try {
      const tokenData = JSON.parse(atob(adminToken.split('.')[1]))
      const isExpired = Date.now() >= tokenData.exp * 1000
      
      if (isExpired) {
        const response = NextResponse.redirect(new URL('/admin/login', req.url))
        response.cookies.delete('adminToken')
        return response
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Handle protected user routes
  if (req.nextUrl.pathname.startsWith('/report') || 
      req.nextUrl.pathname.startsWith('/my-issues') ||
      req.nextUrl.pathname.startsWith('/profile')) {
    
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return NextResponse.redirect(new URL('/?auth=login', req.url))
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/?auth=login', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/report/:path*',
    '/my-issues/:path*',
    '/profile/:path*'
  ]
}
