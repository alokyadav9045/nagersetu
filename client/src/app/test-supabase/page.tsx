'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DatabaseSetupCheck } from '@/components/DatabaseSetupCheck'

type UserProfile = {
  email: string;
  full_name?: string;
  role?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
};

type ResultsType = {
  simpleSelect?: { data?: any; error?: any };
  insertTest?: { data?: any; error?: any };
  generalError?: any;
};

export default function TestSupabase() {
  const [results, setResults] = useState<ResultsType>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        
        // Test 1: Simple connection test
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Supabase Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
        
        // Test 2: Try simple select with error handling
        try {
          const { data: simpleSelect, error: simpleError } = await (supabase as any)
            .from('user_profiles')
            .select('*')
            .limit(1)

          setResults((prev: ResultsType) => ({
            ...prev,
            simpleSelect: { data: simpleSelect, error: simpleError }
          }));
        } catch (selectError) {
          setResults((prev: ResultsType) => ({
            ...prev,
            simpleSelect: { error: selectError }
          }));
        }

        // Test 3: Try to insert a test record
        try {
          const { data: insertTest, error: insertError } = await (supabase as any)
            .from('user_profiles')
            .insert([
              {
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'citizen'
              }
            ])
            .select();

          setResults((prev: ResultsType) => ({
            ...prev,
            insertTest: { data: insertTest, error: insertError }
          }));
        } catch (insertError) {
          setResults((prev: ResultsType) => ({
            ...prev,
            insertTest: { error: insertError }
          }));
        }

      } catch (error) {
        console.error('Test error:', error)
        setResults((prev: ResultsType) => ({
          ...prev,
          generalError: error
        }));
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      {/* Critical Error Alert */}
      <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">🔥 ACTION REQUIRED!</h2>
        <p className="text-red-700 font-medium mb-2">
          Your database has "infinite recursion in policy" error. This needs immediate fixing!
        </p>
        <ol className="text-red-700 text-sm space-y-1 ml-4 list-decimal">
          <li>Open your <strong>Supabase Dashboard</strong></li>
          <li>Go to <strong>SQL Editor</strong></li>
          <li>Copy the <strong>FIXED script</strong> from the red box below</li>
          <li><strong>Run the script</strong> - this will fix the policy issue</li>
          <li><strong>Refresh this page</strong> to verify the fix</li>
        </ol>
      </div>

      {/* Database Setup Check Component */}
      <div className="mb-6">
        <DatabaseSetupCheck />
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-semibold text-blue-800 mb-2">Environment Check:</h3>
          <div className="text-sm space-y-1">
            <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Key (first 20 chars):</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-gray-50 p-4 rounded border">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Running tests...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-2">Simple Select Test:</h3>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border">{JSON.stringify(results.simpleSelect, null, 2)}</pre>
            </div>

            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-semibold mb-2">Insert Test:</h3>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border">{JSON.stringify(results.insertTest, null, 2)}</pre>
            </div>

            {results.generalError && (
              <div className="bg-red-50 p-4 rounded border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">General Error:</h3>
                <pre className="text-xs text-red-700 overflow-auto bg-white p-2 rounded border">{JSON.stringify(results.generalError, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 p-4 bg-red-50 rounded border border-red-200">
        <h3 className="font-semibold text-red-800 mb-2">🚨 IMPORTANT: Use the Fixed SQL Script!</h3>
        <p className="text-sm text-red-700 mb-2">
          The error shows "infinite recursion in policy" - this means the RLS policies have a circular reference.
          <br/>
          <strong>Use the FIXED script below instead:</strong>
        </p>
        <div className="bg-white p-4 rounded border overflow-auto max-h-64">
          <pre className="text-xs">
{`-- =========================================
-- FIXED SUPABASE DATABASE SETUP SCRIPT
-- This fixes the infinite recursion in RLS policies
-- =========================================

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access" ON user_profiles;
DROP POLICY IF EXISTS "Public read access" ON issues;
DROP POLICY IF EXISTS "Public read access" ON categories;

-- Disable RLS temporarily to avoid issues
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;

-- Create tables with proper structure
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    category TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    location_lat DECIMAL,
    location_lng DECIMAL,
    location_address TEXT,
    location TEXT,
    images TEXT[],
    citizen_id UUID REFERENCES user_profiles(id),
    assigned_to UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories and users
INSERT INTO categories (name, description, icon, color) VALUES
    ('Water Supply', 'Issues related to water supply and quality', 'droplets', 'blue'),
    ('Roads & Infrastructure', 'Road maintenance, potholes, traffic issues', 'road', 'gray'),
    ('Electricity', 'Power outages, electrical problems', 'zap', 'yellow'),
    ('Waste Management', 'Garbage collection, cleanliness issues', 'trash-2', 'green'),
    ('Other', 'Other civic issues', 'more-horizontal', 'gray')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS with FIXED policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Allow public read access" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);`}
          </pre>
        </div>
      </div>
    </div>
  )
}
