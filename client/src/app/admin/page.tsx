'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({})
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
      return
    }

    setUser(user)

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile || (profile as any).role === 'citizen') {
      router.push('/')
      return
    }

    setUserProfile(profile)
    await fetchDashboardData()
    setLoading(false)
  }

  const fetchDashboardData = async () => {
    try {
      // Basic stats
      const { data: allIssues } = await supabase
        .from('issues')
        .select('*')

      const { data: todayIssues } = await supabase
        .from('issues')
        .select('*')
        .gte('created_at', new Date().toISOString().split('T')[0])

      const statsData = {
        totalIssues: allIssues?.length || 0,
        pendingIssues: (allIssues as any[])?.filter(i => i.status === 'pending').length || 0,
        resolvedIssues: (allIssues as any[])?.filter(i => i.status === 'resolved').length || 0,
        todayIssues: todayIssues?.length || 0,
        resolutionRate: (allIssues as any[])?.length ? 
          Math.round(((allIssues as any[]).filter(i => i.status === 'resolved').length / (allIssues as any[]).length) * 100) : 0
      }
      setStats(statsData)

      // Category breakdown
      const { data: categoryStats } = await supabase
        .from('issues')
        .select(`
          category_id,
          issue_categories (name, color)
        `)

      const categoryGroups = categoryStats?.reduce((acc: any, issue: any) => {
        const categoryName = issue.issue_categories.name
        acc[categoryName] = (acc[categoryName] || 0) + 1
        return acc
      }, {}) || {}

      const categoryChartData = Object.entries(categoryGroups).map(([name, count]) => ({
        name,
        value: count,
        count
      }))
      setCategoryData(categoryChartData)

      // Status breakdown
      const statusGroups = (allIssues as any[])?.reduce((acc: any, issue: any) => {
        acc[issue.status] = (acc[issue.status] || 0) + 1
        return acc
      }, {}) || {}

      const statusColors = {
        pending: '#FEF3C7',
        in_progress: '#DBEAFE', 
        resolved: '#D1FAE5',
        rejected: '#FEE2E2'
      }

      const statusChartData = Object.entries(statusGroups).map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count,
        count,
        color: statusColors[status as keyof typeof statusColors]
      }))
      setStatusData(statusChartData)

      // 7-day trends
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const trendsPromises = last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const { data } = await supabase
          .from('issues')
          .select('*')
          .gte('created_at', date)
          .lt('created_at', nextDate.toISOString().split('T')[0])

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          issues: data?.length || 0
        }
      })

      const trendsResults = await Promise.all(trendsPromises)
      setTrendsData(trendsResults)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-lg h-32"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-300 rounded-lg h-80"></div>
              <div className="bg-gray-300 rounded-lg h-80"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of civic issues and system performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
                    </div>
                  </div>
                </div>
      
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingIssues}</p>
                    </div>
                  </div>
                </div>
      
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Resolved Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.resolvedIssues}</p>
                    </div>
                  </div>
                </div>
      
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Today's Issues</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.todayIssues}</p>
                    </div>
                  </div>
                </div>
              </div>
      
                        {/* Add more dashboard content below as needed */}
                
              </div>
    </div>
  )
}
