'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, Eye, CheckCircle, XCircle, Clock, 
  MapPin, Calendar, User, AlertTriangle,
  ArrowUpDown, Download, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// Updated interface with proper typing
interface Issue {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category_id?: number
  location_address: string | null
  created_at: string
  updated_at: string
  citizen_id: string
  user_profiles: {
    full_name: string | null
    email: string
  } | null
  categories?: {
    name: string
    color: string
  } | null
}

interface Stats {
  total: number
  pending: number
  in_progress: number
  resolved: number
  rejected: number
}

type StatusType = 'pending' | 'in_progress' | 'resolved' | 'rejected'
type PriorityType = 'low' | 'medium' | 'high' | 'urgent'

export default function AdminIssues() {
  // State management
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0
  })

  // Effects
  useEffect(() => {
    // Debug Supabase configuration
    console.log('Supabase configuration check:', {
      hasSupabase: !!supabase,
      hasFrom: !!(supabase && supabase.from),
      hasAuth: !!(supabase && supabase.auth),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
    })
    
    checkDatabaseAndFetch()
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder])

  // Check database setup and fetch data
  const checkDatabaseAndFetch = async () => {
    try {
      // First check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.warn('User not authenticated for admin access:', authError)
        toast.error('Authentication required. Please log in.')
        setLoading(false)
        return
      }

      // Quick connectivity test
      const { error: testError } = await (supabase as any)
        .from('issues')
        .select('count', { count: 'exact', head: true })

      if (testError) {
        if (testError.message?.includes('relation') && testError.message?.includes('does not exist')) {
          toast.error('Database tables not set up. Please configure database first.')
          setLoading(false)
          return
        }
      }

      // If database is accessible, fetch data
      await Promise.all([fetchIssues(), fetchStats()])
    } catch (error) {
      console.error('Database connectivity check failed:', error)
      toast.error('Unable to connect to database.')
      setLoading(false)
    }
  }

  // Fetch issues with proper error handling
  const fetchIssues = async () => {
    try {
      setLoading(true)
      
      // Use any casting to bypass TypeScript issues temporarily
      let query = (supabase as any)
        .from('issues')
        .select(`
          *,
          user_profiles!citizen_id (
            full_name, 
            email
          ),
          categories (
            name,
            color
          )
        `)

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter)
      }
      
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) {
        // Detailed error logging for debugging
        console.error('Supabase query error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stack: error.stack,
          fullError: error
        })
        
        // Handle specific database errors
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Database tables not set up properly:', error)
          toast.error('Database not configured. Please run database setup first.')
          setIssues([])
          return
        }
        
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.warn('Permission denied accessing issues:', error)
          toast.error('You do not have permission to view issues. Please check your admin status.')
          setIssues([])
          return
        }

        if (error.message?.includes('JWT') || error.message?.includes('expired') || error.message?.includes('token')) {
          console.warn('Authentication error:', error)
          toast.error('Your session has expired. Please log in again.')
          setIssues([])
          return
        }

        // Handle empty error objects or network errors
        if (!error.message && Object.keys(error).length === 0) {
          console.warn('Empty error object received, likely authentication or network issue')
          toast.error('Authentication failed or network error. Please check your connection and login status.')
          setIssues([])
          return
        }

        if (!error.message) {
          console.warn('Error object without message:', error)
          toast.error('Unknown database error occurred. Please try again or contact support.')
          setIssues([])
          return
        }

        console.error('Error fetching issues:', error)
        toast.error(`Failed to fetch issues: ${error.message || 'Unknown database error'}`)
        setIssues([])
        return
      }

      setIssues(data || [])
    } catch (error: any) {
      // Detailed error logging for debugging
      console.error('Exception in fetchIssues:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        fullError: error
      })
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message?.includes('fetch')) {
        console.error('Network/fetch error detected')
        toast.error('Network error. Please check your internet connection.')
        setIssues([])
        return
      }
      
      // Check if it's a timeout error
      if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
        console.error('Timeout error detected')
        toast.error('Request timed out. Please try again.')
        setIssues([])
        return
      }
      
      // Check if it's an authentication error
      if (error.message?.includes('auth') || error.message?.includes('JWT')) {
        console.error('Authentication error detected')
        toast.error('Authentication failed. Please log in again.')
        setIssues([])
        return
      }
      
      // Generic error handling
      console.error('Unknown error in fetchIssues:', error)
      toast.error(`Failed to fetch issues: ${error?.message || 'Unknown error occurred'}`)
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('issues')
        .select('status')

      if (error) {
        // Handle database errors gracefully
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('Issues table does not exist for stats:', error)
          // Set default stats when table doesn't exist
          setStats({
            total: 0,
            pending: 0,
            in_progress: 0,
            resolved: 0,
            rejected: 0
          })
          return
        }
        console.error('Admin Issues stats query error:', {
          message: (error as any)?.message || String(error),
          details: (error as any)?.details || null,
          hint: (error as any)?.hint || null,
          code: (error as any)?.code || null
        })
        setStats({ total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 })
        return
      }

      const statsData = data?.reduce((acc: Stats, issue: { status: string }) => {
        acc.total++
        const status = issue.status as keyof Omit<Stats, 'total'>
        if (status in acc) {
          acc[status] = (acc[status] || 0) + 1
        }
        return acc
      }, { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 })

      setStats(statsData || { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 })
    } catch (error: any) {
      console.error('Admin Issues stats error:', {
        message: error?.message || String(error),
        stack: error?.stack || null
      })
    }
  }

  // Update issue status with proper error handling
  const updateIssueStatus = async (issueId: string, newStatus: StatusType) => {
    if (updating === issueId) return // Prevent double updates
    
    try {
      setUpdating(issueId)
      
      // Bypass TypeScript issues with any casting
      const updateData = { status: newStatus }
      const { error } = await (supabase as any)
        .from('issues')
        .update(updateData)
        .eq('id', issueId)
          
      if (error) {
        // Handle specific database errors
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          toast.error('Database not configured. Cannot update issue status.')
          return
        }
        
        if (error.message?.includes('permission denied')) {
          toast.error('You do not have permission to update issues.')
          return
        }

        throw error
      }

      toast.success(`Issue status updated to ${newStatus.replace('_', ' ')}`)
      
      // Refresh data
      await Promise.all([fetchIssues(), fetchStats()])
    } catch (error: any) {
      console.error('Error updating issue status:', error)
      
      // Provide user-friendly error messages
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection.')
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error(`Failed to update issue status: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setUpdating(null)
    }
  }

  // Get status badge with proper styling
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
      pending: { 
        label: 'Pending', 
        variant: 'secondary',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      in_progress: { 
        label: 'In Progress', 
        variant: 'default',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      resolved: { 
        label: 'Resolved', 
        variant: 'default',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      rejected: { 
        label: 'Rejected', 
        variant: 'destructive',
        color: 'bg-red-100 text-red-800 border-red-300'
      }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  // Get priority badge with proper colors
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; class: string }> = {
      low: { label: 'Low', class: 'bg-green-100 text-green-800' },
      medium: { label: 'Medium', class: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'High', class: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgent', class: 'bg-red-100 text-red-800' }
    }
    
    const config = priorityConfig[priority] || priorityConfig.medium
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    )
  }

  // Export data to CSV
  const exportData = () => {
    try {
      if (issues.length === 0) {
        toast.error('No data to export')
        return
      }

      const csvContent = [
        ['ID', 'Title', 'Description', 'Status', 'Priority', 'Category', 'Reporter', 'Location', 'Created At', 'Updated At'],
        ...issues.map(issue => [
          issue.id,
          `"${issue.title.replace(/"/g, '""')}"`, // Escape quotes
          `"${issue.description.replace(/"/g, '""')}"`, // Escape quotes
          issue.status,
          issue.priority,
          issue.categories?.name || 'No category',
          issue.user_profiles?.full_name || issue.user_profiles?.email || 'Unknown',
          `"${issue.location_address || 'No location'}"`,
          new Date(issue.created_at).toLocaleString(),
          new Date(issue.updated_at).toLocaleString()
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `nagarsetu-issues-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Exported ${issues.length} issues successfully!`)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
    toast.success('Filters cleared')
  }

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchIssues(), fetchStats()])
    toast.success('Data refreshed')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Management</h1>
            <p className="text-gray-600 mt-1">Manage and track reported civic issues</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/diagnostic">
              <Button variant="outline" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Diagnostic
              </Button>
            </Link>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={exportData} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'total', label: 'Total Issues', value: stats.total, color: 'text-blue-600' },
            { key: 'pending', label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { key: 'in_progress', label: 'In Progress', value: stats.in_progress, color: 'text-blue-600' },
            { key: 'resolved', label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
            { key: 'rejected', label: 'Rejected', value: stats.rejected, color: 'text-red-600' }
          ].map((stat) => (
            <Card key={stat.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Last Updated</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading issues...</p>
              </CardContent>
            </Card>
          ) : issues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'No issues match your current filters.' 
                    : 'No issues have been reported yet.'}
                </p>
                {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <Button onClick={clearFilters} className="mt-4" variant="outline">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title and badges */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {issue.title}
                          </h3>
                          {getStatusBadge(issue.status)}
                          {getPriorityBadge(issue.priority)}
                          {issue.categories && (
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: issue.categories.color }}
                            >
                              {issue.categories.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {issue.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            {issue.user_profiles?.full_name || 
                             issue.user_profiles?.email || 
                             'Unknown User'}
                          </span>
                        </div>
                        {issue.location_address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate max-w-xs" title={issue.location_address}>
                              {issue.location_address}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Link href={`/issue/${issue.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      {/* Status Update Select */}
                      <Select 
                        value={issue.status} 
                        onValueChange={(value) => updateIssueStatus(issue.id, value as StatusType)}
                        disabled={updating === issue.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {updating === issue.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results summary */}
        {!loading && issues.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {issues.length} of {stats.total} total issues
          </div>
        )}
      </div>
    </div>
  )
}
