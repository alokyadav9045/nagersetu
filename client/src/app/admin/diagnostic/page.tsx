'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning' | 'loading'
  message: string
  details?: any
}

export default function AdminDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // Check environment variables
    diagnostics.push({
      name: 'Environment Variables',
      status: 'loading',
      message: 'Checking...'
    })

    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    diagnostics[0] = {
      name: 'Environment Variables',
      status: hasUrl && hasKey ? 'success' : 'error',
      message: hasUrl && hasKey ? 'All environment variables are set' : 'Missing environment variables',
      details: {
        NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'Set' : 'Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: hasKey ? 'Set' : 'Not set'
      }
    }

    setResults([...diagnostics])

    // Check Supabase client
    diagnostics.push({
      name: 'Supabase Client',
      status: 'loading',
      message: 'Checking...'
    })

    const hasSupabase = !!supabase
    const hasAuth = !!(supabase && supabase.auth)
    const hasFrom = !!(supabase && supabase.from)

    diagnostics[1] = {
      name: 'Supabase Client',
      status: hasSupabase && hasAuth && hasFrom ? 'success' : 'error',
      message: hasSupabase && hasAuth && hasFrom ? 'Supabase client initialized properly' : 'Supabase client not properly initialized',
      details: {
        hasSupabase,
        hasAuth,
        hasFrom
      }
    }

    setResults([...diagnostics])

    // Check authentication
    diagnostics.push({
      name: 'Authentication',
      status: 'loading',
      message: 'Checking...'
    })

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      diagnostics[2] = {
        name: 'Authentication',
        status: user ? 'success' : 'warning',
        message: user ? `Authenticated as ${user.email}` : 'No user authenticated',
        details: {
          userId: user?.id,
          email: user?.email,
          error: authError?.message
        }
      }
    } catch (error: any) {
      diagnostics[2] = {
        name: 'Authentication',
        status: 'error',
        message: 'Authentication check failed',
        details: { error: error.message }
      }
    }

    setResults([...diagnostics])

    // Check database connectivity
    diagnostics.push({
      name: 'Database Connectivity',
      status: 'loading',
      message: 'Checking...'
    })

    try {
      const { error } = await supabase
        .from('issues')
        .select('count', { count: 'exact', head: true })

      diagnostics[3] = {
        name: 'Database Connectivity',
        status: error ? 'error' : 'success',
        message: error ? `Database error: ${error.message}` : 'Database connection successful',
        details: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      }
    } catch (error: any) {
      diagnostics[3] = {
        name: 'Database Connectivity',
        status: 'error',
        message: 'Database connectivity check failed',
        details: { error: error.message }
      }
    }

    setResults([...diagnostics])

    // Check user_profiles table
    diagnostics.push({
      name: 'User Profiles Table',
      status: 'loading',
      message: 'Checking...'
    })

    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true })

      diagnostics[4] = {
        name: 'User Profiles Table',
        status: error ? 'error' : 'success',
        message: error ? `User profiles table error: ${error.message}` : 'User profiles table accessible',
        details: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      }
    } catch (error: any) {
      diagnostics[4] = {
        name: 'User Profiles Table',
        status: 'error',
        message: 'User profiles table check failed',
        details: { error: error.message }
      }
    }

    setResults([...diagnostics])

    // Check categories table
    diagnostics.push({
      name: 'Categories Table',
      status: 'loading',
      message: 'Checking...'
    })

    try {
      const { error } = await supabase
        .from('categories')
        .select('count', { count: 'exact', head: true })

      diagnostics[5] = {
        name: 'Categories Table',
        status: error ? 'error' : 'success',
        message: error ? `Categories table error: ${error.message}` : 'Categories table accessible',
        details: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      }
    } catch (error: any) {
      diagnostics[5] = {
        name: 'Categories Table',
        status: 'error',
        message: 'Categories table check failed',
        details: { error: error.message }
      }
    }

    setResults([...diagnostics])
    setIsRunning(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Diagnostic Panel</h1>
          <p className="mt-2 text-gray-600">
            Check system status and database connectivity
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Diagnostics</h2>
          <Button onClick={runDiagnostics} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              'Rerun Diagnostics'
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  <span>{result.name}</span>
                </CardTitle>
                <CardDescription>
                  {result.message}
                </CardDescription>
              </CardHeader>
              {result.details && (
                <CardContent>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Instructions</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. Ensure your <code>.env.local</code> file contains the correct Supabase credentials</p>
            <p>2. Run the database setup SQL scripts to create the required tables</p>
            <p>3. Make sure Row Level Security (RLS) policies are properly configured</p>
            <p>4. Verify that your Supabase project is active and accessible</p>
          </div>
        </div>
      </div>
    </div>
  )
}
