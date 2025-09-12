'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  AlertTriangle, Calendar, MapPin, Search, Filter, 
  Plus, Eye, Edit, Trash2, Clock, CheckCircle, 
  XCircle, Activity, ThumbsUp 
} from 'lucide-react'

interface Issue {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location_address: string | null
  images: string[] | null
  upvotes: number
  created_at: string
  updated_at: string
  issue_categories: {
    name: string
    color: string
  }
}

export default function MyIssuesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  useEffect(() => {
    initializePage()
  }, [searchTerm, statusFilter, priorityFilter])

  const initializePage = async () => {
    await getUser()
    setLoading(false)
  }

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to view your issues')
        router.push('/')
        return
      }

      setUser(user)
      await fetchUserIssues(user.id)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/')
    }
  }

  const fetchUserIssues = async (userId: string) => {
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          issue_categories (name, color)
        `)
        .eq('citizen_id', userId)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      if (priorityFilter) {
        query = query.eq('priority', priorityFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setIssues(data as Issue[] || [])
    } catch (error) {
      console.error('Failed to fetch issues:', error)
      toast.error('Failed to load your issues')
    }
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      in_progress: Activity,
      resolved: CheckCircle,
      rejected: XCircle
    }
    return icons[status as keyof typeof icons] || Clock
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority as keyof typeof colors] || 'text-gray-600'
  }

  const deleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId)

      if (error) throw error

      setIssues(prev => prev.filter(issue => issue.id !== issueId))
      toast.success('Issue deleted successfully')
    } catch (error) {
      console.error('Failed to delete issue:', error)
      toast.error('Failed to delete issue')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-10 bg-gray-300 rounded mb-4"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please login to view your issues.</p>
        </div>
      </div>
    )
  }

  const filteredIssues = issues

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Issues</h1>
            <p className="text-gray-600">
              Manage and track your reported civic issues
            </p>
          </div>
          
          <Link
            href="/report"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setPriorityFilter('')
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
            <p className="text-gray-600 mb-6">
              {issues.length === 0 
                ? "You haven't reported any issues yet." 
                : "No issues match your current filters."
              }
            </p>
            <Link
              href="/report"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const StatusIcon = getStatusIcon(issue.status)
              
              return (
                <div key={issue.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {issue.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                              <StatusIcon className="inline h-3 w-3 mr-1" />
                              {issue.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: issue.issue_categories?.color || '#9CA3AF' }}
                            ></div>
                            <span>{issue.issue_categories?.name || 'Uncategorized'}</span>
                          </div>

                          <div className={`font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority} priority
                          </div>

                          {issue.location_address && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-48">{issue.location_address}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{issue.upvotes} votes</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                        <Link
                          href={`/issue/${issue.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>

                        {issue.status === 'pending' && (
                          <Link
                            href={`/issue/${issue.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        )}

                        <button
                          onClick={() => deleteIssue(issue.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Issue Images Preview */}
                    {issue.images && issue.images.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex space-x-2 overflow-x-auto">
                          {issue.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Issue ${index + 1}`}
                              className="h-16 w-16 object-cover rounded-lg flex-shrink-0"
                            />
                          ))}
                          {issue.images.length > 3 && (
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                +{issue.images.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {filteredIssues.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
                <div className="text-sm text-gray-500">Total Issues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {issues.filter(i => i.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {issues.filter(i => i.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {issues.filter(i => i.status === 'resolved').length}
                </div>
                <div className="text-sm text-gray-500">Resolved</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
