'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Database, ExternalLink } from 'lucide-react'

interface DatabaseStatus {
  connected: boolean
  userProfilesExists: boolean
  issuesExists: boolean
  categoriesExists: boolean
  error?: string
}

export function DatabaseSetupCheck() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    userProfilesExists: false,
    issuesExists: false,
    categoriesExists: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      // Test connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)

      const connected = !connectionError
      let userProfilesExists = connected
      let issuesExists = false
      let categoriesExists = false

      if (connected) {
        // Test issues table
        const { error: issuesError } = await supabase
          .from('issues')
          .select('count')
          .limit(1)
        issuesExists = !issuesError

        // Test categories table
        const { error: categoriesError } = await supabase
          .from('categories')
          .select('count')
          .limit(1)
        categoriesExists = !categoriesError
      }

      setStatus({
        connected,
        userProfilesExists,
        issuesExists,
        categoriesExists,
        error: connectionError?.message
      })
    } catch (error) {
      setStatus({
        connected: false,
        userProfilesExists: false,
        issuesExists: false,
        categoriesExists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const allTablesExist = status.connected && status.userProfilesExists && status.issuesExists && status.categoriesExists

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Checking database status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (allTablesExist) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Database is properly configured!</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <span>Database Setup Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-yellow-700">
            Some database tables are missing. Please set up the database to use all features.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-800">Table Status:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                {status.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span>Supabase Connection</span>
              </div>
              <div className="flex items-center space-x-2">
                {status.userProfilesExists ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span>user_profiles table</span>
              </div>
              <div className="flex items-center space-x-2">
                {status.issuesExists ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span>issues table</span>
              </div>
              <div className="flex items-center space-x-2">
                {status.categoriesExists ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span>categories table</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-yellow-300">
            <h4 className="font-medium text-yellow-800 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Copy and run the SQL script from <code>supabase-setup.sql</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkDatabaseStatus}
            >
              <Database className="h-4 w-4 mr-2" />
              Recheck Database
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(process.env.NEXT_PUBLIC_SUPABASE_URL, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase
            </Button>
          </div>

          {status.error && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {status.error}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
