'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import { 
  Search, Filter, Calendar, User, Activity, 
  AlertCircle, CheckCircle, XCircle, Clock,
  Eye, Download, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'

interface ActivityLog {
  id: string
  action: string
  description: string
  user_id: string
  entity_type: 'issue' | 'user' | 'system'
  entity_id: string
  metadata: any
  created_at: string
  user_profiles: {
    full_name: string
    email: string
    role: string
  }
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 20

  useEffect(() => {
    fetchLogs(true)
  }, [searchTerm, entityFilter, dateFilter])

  const fetchLogs = async (reset = false) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      const offset = (currentPage - 1) * itemsPerPage

      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user_profiles (full_name, email, role)
        `)

      // Apply filters
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter)
      }
      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
      }
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

      const { data, error } = await query

      if (error) throw error

      if (reset) {
        setLogs(data || [])
        setPage(1)
      } else {
        setLogs(prev => [...prev, ...(data || [])])
      }
      
      setHasMore((data || []).length === itemsPerPage)
      if (!reset) setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to fetch activity logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'update':
      case 'updated':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'delete':
      case 'deleted':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'login':
        return <User className="h-4 w-4 text-green-600" />
      case 'logout':
        return <User className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getEntityBadge = (entityType: string) => {
    const entityConfig = {
      issue: { label: 'Issue', variant: 'default' as const },
      user: { label: 'User', variant: 'secondary' as const },
      system: { label: 'System', variant: 'outline' as const }
    }
    const config = entityConfig[entityType as keyof typeof entityConfig]
    return <Badge variant={config?.variant}>{config?.label}</Badge>
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-gray-600">Monitor system activity and user actions</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => fetchLogs(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="issue">Issues</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-3">
        {loading && logs.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
              <p className="text-gray-600">No logs match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {log.action}
                        </h3>
                        {getEntityBadge(log.entity_type)}
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {log.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={`https://avatar.vercel.sh/${log.user_profiles?.email}`} />
                            <AvatarFallback>
                              {log.user_profiles?.full_name?.charAt(0) || log.user_profiles?.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {log.user_profiles?.full_name || log.user_profiles?.email || 'System'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.user_profiles?.role || 'system'}
                          </Badge>
                        </div>
                        
                        {log.entity_id && (
                          <div className="flex items-center space-x-1">
                            <span>ID: {log.entity_id.slice(0, 8)}...</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                          <details>
                            <summary className="cursor-pointer text-gray-700 font-medium">
                              View Details
                            </summary>
                            <pre className="mt-2 text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {hasMore && (
              <div className="text-center py-4">
                <Button 
                  variant="outline" 
                  onClick={() => fetchLogs(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
