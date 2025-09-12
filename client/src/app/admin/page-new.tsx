'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Users, FileText, CheckCircle, Clock, TrendingUp, AlertCircle, Activity, BarChart3 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    todayIssues: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      await fetchStats()
    }
    run()
    const interval = setInterval(run, 30000) // Refresh every 30 seconds
    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const queries = [
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('issues').select('id', { count: 'exact', head: true }),
        supabase.from('issues').select('id', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('updated_at', weekAgo)
      ]

      const [usersRes, issuesRes, pendingRes, resolvedRes, todayRes, activeRes] = await Promise.allSettled(queries)

      const safeCount = (res: any, label: string) => {
        if (res.status === 'fulfilled') {
          const { error, count } = res.value
          if (error) {
            const msg = typeof error?.message === 'string' ? error.message : JSON.stringify(error)
            console.warn(`Admin Dashboard ${label} count error:`, msg)
          }
          return count || 0
        } else {
          const reason = res.reason
          const msg = typeof reason?.message === 'string' ? reason.message : JSON.stringify(reason)
          console.warn(`Admin Dashboard ${label} count failed:`, msg)
          return 0
        }
      }

      setStats({
        totalUsers: safeCount(usersRes, 'users'),
        totalIssues: safeCount(issuesRes, 'issues'),
        pendingIssues: safeCount(pendingRes, 'pending'),
        resolvedIssues: safeCount(resolvedRes, 'resolved'),
        todayIssues: safeCount(todayRes, 'today'),
        activeUsers: safeCount(activeRes, 'active')
      })
    } catch (error: any) {
      console.error('Admin Dashboard fatal stats error:', {
        message: error?.message || String(error),
        stack: error?.stack || null
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and manage your Nagarsetu platform efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? '...' : stats.activeUsers} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {loading ? '...' : stats.todayIssues} reported today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingIssues}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? '...' : stats.resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your platform efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/admin/issues'}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Manage Issues
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/admin/users'}
                >
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = '/admin/logs'}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={fetchStats}
                  disabled={loading}
                >
                  <Activity className="h-6 w-6 mb-2" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm">New user registration: user@example.com</p>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm">Issue #123 marked as resolved</p>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm">New issue reported: Water supply problem</p>
                  <span className="text-xs text-gray-500">10 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm">System backup completed successfully</p>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
