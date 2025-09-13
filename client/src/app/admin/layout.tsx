"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminNavbar } from '@/components/admin/AdminNavbar'
import { AdminFooter } from '@/components/admin/AdminFooter'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideChrome = pathname === '/admin/login'
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideChrome && <AdminNavbar />}
      <div className={hideChrome ? '' : 'flex-1'}>{children}</div>
      {!hideChrome && <AdminFooter />}
    </div>
  )
}
