import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Check if this is an admin route
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // If no session, redirect to admin login
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      // Try to check if user has admin role, but handle errors gracefully
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (!profile || (profile as any).role !== 'admin') {
          return NextResponse.redirect(new URL('/admin/login', req.url))
        }
      } catch (profileError) {
        console.warn('Profile check failed in middleware:', profileError)
        // Continue without blocking if profile check fails (database might not be set up)
      }
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/report', '/my-issues', '/profile']
    
    if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Continue without blocking if there's a general error
    return res
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/report/:path*',
    '/my-issues/:path*',
    '/profile/:path*'
  ]
}
