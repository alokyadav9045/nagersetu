'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import ErrorHandler from '@/components/ErrorBoundary'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') || false

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAdminRoute && <Navbar />}
        <ErrorHandler>
          <main className="min-h-screen">
            {children}
          </main>
        </ErrorHandler>
        {!isAdminRoute && <Footer />}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
