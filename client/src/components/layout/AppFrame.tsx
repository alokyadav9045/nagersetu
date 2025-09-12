'use client'
import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import ErrorHandler from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'

export default function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') || false

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ErrorHandler>
        <main className="min-h-screen">
          {children}
        </main>
      </ErrorHandler>
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" />
    </>
  )
}
