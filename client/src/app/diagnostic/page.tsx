'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function DiagnosticPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults = []

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('issue_categories').select('count').limit(1)
      testResults.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Connected successfully',
        details: error ? `Error code: ${error.code}` : 'Database is accessible'
      })
    } catch (error: any) {
      testResults.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Connection failed',
        details: error.message
      })
    }

    // Test 2: Check tables
    const tables = ['issue_categories', 'issues', 'user_profiles', 'issue_votes', 'issue_comments']
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        testResults.push({
          name: `Table: ${table}`,
          status: error ? 'error' : 'success',
          message: error ? `Table not found or inaccessible` : `Table exists and accessible`,
          details: error ? error.message : `Found ${data?.length || 0} records (showing max 1)`
        })
      } catch (error: any) {
        testResults.push({
          name: `Table: ${table}`,
          status: 'error',
          message: 'Table check failed',
          details: error.message
        })
      }
    }

    // Test 3: Authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      testResults.push({
        name: 'Authentication',
        status: error ? 'error' : (user ? 'success' : 'warning'),
        message: error ? 'Auth error' : (user ? `Logged in as ${user.email}` : 'Not logged in'),
        details: error ? error.message : (user ? `User ID: ${user.id}` : 'No active session')
      })
    } catch (error: any) {
      testResults.push({
        name: 'Authentication',
        status: 'error',
        message: 'Auth check failed',
        details: error.message
      })
    }

    setTests(testResults)
    setLoading(false)
  }

  const setupDefaultCategories = async () => {
    const defaultCategories = [
      { name: 'Water Supply', description: 'Water related issues', icon: 'droplets', color: 'blue' },
      { name: 'Roads & Infrastructure', description: 'Road and infrastructure issues', icon: 'road', color: 'gray' },
      { name: 'Electricity', description: 'Power and electrical issues', icon: 'zap', color: 'yellow' },
      { name: 'Waste Management', description: 'Garbage and cleanliness', icon: 'trash-2', color: 'green' },
      { name: 'Public Safety', description: 'Safety and security concerns', icon: 'shield', color: 'red' },
      { name: 'Other', description: 'Other civic issues', icon: 'more-horizontal', color: 'gray' }
    ]

    try {
      const { error } = await supabase
        .from('issue_categories')
        .upsert(defaultCategories as any, { onConflict: 'name' })

      if (error) throw error
      alert('Default categories created successfully!')
      runTests()
    } catch (error: any) {
      alert(`Failed to create categories: ${error.message}`)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default: return <RefreshCw className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Diagnostics</h1>
        <p className="text-gray-600 mt-2">Check your database setup and fix issues</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Run tests and setup operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={runTests} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Run Tests
              </Button>
              <Button onClick={setupDefaultCategories} variant="outline">
                Setup Categories
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h3 className="font-medium">{test.name}</h3>
                    <p className="text-sm text-gray-600">{test.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{test.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">If tables don't exist:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Copy and run the SQL from <code>supabase-setup.sql</code></li>
                  <li>Return here and run tests again</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
