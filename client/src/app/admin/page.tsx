'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0
  })
  const [loading, setLoading] = useState(true)

  // Middleware enforces access with httpOnly cookie; once rendered we can fetch
  // stats without performing client-side redirects here to avoid loops.
  // Mark loading complete immediately and let middleware gate access.
  // Fetch stats below.
  
  useEffect(() => {
    let mounted = true
    fetchStats().finally(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const fetchStats = async () => {
    try {
      const [usersResult, issuesResult] = await Promise.all([
        (supabase as any).from('user_profiles').select('*').then((result: any) => {
          if (result.error) {
            // Handle table not existing
            if (result.error.message?.includes('relation') && result.error.message?.includes('does not exist')) {
              console.warn('user_profiles table does not exist')
              return { data: [], error: null }
            }
            console.warn('Error fetching users:', result.error)
            return { data: [], error: result.error }
          }
          return result
        }),
        (supabase as any).from('issues').select('*').then((result: any) => {
          if (result.error) {
            // Handle table not existing
            if (result.error.message?.includes('relation') && result.error.message?.includes('does not exist')) {
              console.warn('issues table does not exist')
              return { data: [], error: null }
            }
            console.warn('Error fetching issues:', result.error)
            return { data: [], error: result.error }
          }
          return result
        })
      ])

      const users = usersResult.data || []
      const issues = issuesResult.data || []

      setStats({
        totalUsers: users.length,
        totalIssues: issues.length,
        pendingIssues: issues.filter((i: any) => i.status === 'pending').length,
        resolvedIssues: issues.filter((i: any) => i.status === 'resolved').length
      })

      // Show warning if database isn't set up
      if (users.length === 0 && issues.length === 0) {
        console.warn('Database appears to be empty or not configured')
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set fallback values
      setStats({
        totalUsers: 0,
        totalIssues: 0,
        pendingIssues: 0,
        resolvedIssues: 0
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    localStorage.removeItem('nagarsetu_admin_session')
    toast.success('Logged out successfully')
  router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Nagarsetu Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome to Nagarsetu Admin Panel</h1>
          <p className="text-blue-100">Complete control over your civic issue management system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingIssues}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedIssues}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/issues"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Manage Issues</p>
            </a>
            <a
              href="/admin/users"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Manage Users</p>
            </a>
            <a
              href="/admin/logs"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium">View Logs</p>
            </a>
            <button
              onClick={() => fetchStats()}
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Refresh Data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
