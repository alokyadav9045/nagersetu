import React from 'react'
import { AdminNavbar } from '@/components/admin/AdminNavbar'
import { AdminFooter } from '@/components/admin/AdminFooter'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1">{children}</div>
      <AdminFooter />
    </div>
  )
}
