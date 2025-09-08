'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, FileText, TrendingUp, Activity, 
  Globe, Mail, Phone, MapPin 
} from 'lucide-react'

interface AdminFooterProps {
  className?: string
}

export function AdminFooter({ className = '' }: AdminFooterProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0
  })

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total users with error handling
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      if (usersError) {
        console.warn('Error fetching users:', usersError)
      }

      // Fetch total issues with error handling
      const { count: totalIssues, error: issuesError } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })

      if (issuesError) {
        console.warn('Error fetching issues:', issuesError)
      }

      // Fetch resolved issues with error handling
      const { count: resolvedIssues, error: resolvedError } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')

      if (resolvedError) {
        console.warn('Error fetching resolved issues:', resolvedError)
      }

      // Fetch pending issues with error handling
      const { count: pendingIssues, error: pendingError } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_progress'])

      if (pendingError) {
        console.warn('Error fetching pending issues:', pendingError)
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalIssues: totalIssues || 0,
        resolvedIssues: resolvedIssues || 0,
        pendingIssues: pendingIssues || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set fallback values
      setStats({
        totalUsers: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0
      })
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 mt-auto ${className}`}>
      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Issues</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.totalIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Resolved</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.resolvedIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pending</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.pendingIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About Nagarsetu
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Digital platform for efficient urban governance and citizen engagement.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>nagarsetu.gov.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/admin" className="text-sm text-gray-600 hover:text-blue-600">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/admin/users" className="text-sm text-gray-600 hover:text-blue-600">
                  User Management
                </a>
              </li>
              <li>
                <a href="/admin/issues" className="text-sm text-gray-600 hover:text-blue-600">
                  Issue Management
                </a>
              </li>
              <li>
                <a href="/admin/logs" className="text-sm text-gray-600 hover:text-blue-600">
                  System Logs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>admin@nagarsetu.gov.in</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Government Complex, City</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              System Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All Systems Operational</span>
              </div>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} Nagarsetu. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-blue-600">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
