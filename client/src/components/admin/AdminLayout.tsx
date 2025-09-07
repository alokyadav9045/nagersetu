'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminNavbar } from './AdminNavbar'
import { AdminFooter } from './AdminFooter'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className = '' }: AdminLayoutProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem('nagarsetu_admin_session')
      if (!session) {
        router.push('/admin/login')
        return
      }

      try {
        const sessionData = JSON.parse(session)
        const now = new Date().getTime()
        
        // Check if session is expired (24 hours)
        if (now - sessionData.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('nagarsetu_admin_session')
          router.push('/admin/login')
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Invalid session data:', error)
        localStorage.removeItem('nagarsetu_admin_session')
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <AdminFooter />
    </div>
  )
}
