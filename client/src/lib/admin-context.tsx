'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminContextType {
  isAdminAuthenticated: boolean
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => void
  loading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const adminSession = localStorage.getItem('nagarsetu_admin_session')
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        const now = new Date().getTime()
        const sessionTime = new Date(session.timestamp).getTime()
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60)
        
        if (hoursDiff < 24) {
          setIsAdminAuthenticated(true)
        } else {
          localStorage.removeItem('nagarsetu_admin_session')
        }
      } catch (error) {
        localStorage.removeItem('nagarsetu_admin_session')
      }
    }
    setLoading(false)
  }, [])

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Use environment variables for admin credentials
      const ADMIN_EMAIL = 'admin@nagarsetu.gov.in'
      const ADMIN_PASSWORD = 'Nagarsetu@Admin2025'

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          email: email
        }
        
        localStorage.setItem('nagarsetu_admin_session', JSON.stringify(session))
        setIsAdminAuthenticated(true)
        
        console.log('Admin logged in:', { email, timestamp: new Date().toISOString() })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    }
  }

  const adminLogout = () => {
    localStorage.removeItem('nagarsetu_admin_session')
    setIsAdminAuthenticated(false)
    console.log('Admin logged out:', new Date().toISOString())
  }

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
      loading
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
