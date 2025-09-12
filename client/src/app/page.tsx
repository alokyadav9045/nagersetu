'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MapPin, Calendar, MessageCircle, ThumbsUp, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import HeroSection from '@/components/sections/HeroSection'

export default function Home() {
  const [issues, setIssues] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')


  
  useEffect(() => {
    fetchIssues()
    fetchCategories()
  }, [searchTerm, selectedCategory, selectedStatus])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Error fetching categories:', error)
        return
      }
      
      if (data) setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchIssues = async () => {
    setLoading(true)
    let query = supabase
      .from('issues')
      .select(`
        *,
        issue_categories (name, color, icon),
        user_profiles (full_name)
      `)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    if (selectedStatus) {
      query = query.eq('status', selectedStatus)
    }

    const { data, error } = await query

    if (data) setIssues(data)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
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

  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="bg-gray-50">
        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedStatus('')
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Issues Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <Link key={issue.id} href={`/issue/${issue.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                    {issue.images && issue.images.length > 0 && (
                      <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        <img
                          src={issue.images[0]}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {issue.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {issue.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: issue.issue_categories?.color || '#9CA3AF' }}
                          ></div>
                          <span>{issue.issue_categories?.name || 'Uncategorized'}</span>
                          <span className={`ml-auto font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority} priority
                          </span>
                        </div>

                        {issue.location_address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{issue.location_address}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{issue.upvotes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>0</span> {/* We'll implement comments count later */}
                            </div>
                          </div>
                        </div>
                      </div>

                      {issue.user_profiles && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Reported by {issue.user_profiles.full_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && issues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No issues found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
