
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Shield, Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
type IssueRow = Database['public']['Tables']['issues']['Row']

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ totalIssues: 0, resolvedIssues: 0, pendingIssues: 0 })
  const [formData, setFormData] = useState({ full_name: '', phone: '', address: '' })

  useEffect(() => { void initializePage() }, [])

  async function initializePage() {
    try {
      await getUser()
    } catch (error) {
      console.error('Initialization error:', error)
      toast.error('Failed to initialize profile page')
    } finally {
      setLoading(false)
    }
  }

  async function getUser() {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const userObj = authData?.user
      if (!userObj) {
        toast.error('Please login to view your profile')
        router.push('/')
        return
      }
      setUser(userObj)

      // Get user profile (array form to avoid 406 from single-object Accept header)
      const { data: profileRows, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userObj.id)
        .limit(1)
        .returns<UserProfile[]>()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        toast.error(`Error fetching profile: ${profileError.message || profileError.code || 'Unknown error'}`)
      }

      const profileData = Array.isArray(profileRows) && profileRows.length > 0 ? profileRows[0] : null
      if (profileData && typeof profileData === 'object') {
        setProfile(profileData as UserProfile)
        setFormData({
          full_name: (profileData as UserProfile).full_name || '',
          phone: (profileData as UserProfile).phone || '',
          address: (profileData as UserProfile).address || ''
        })
      } else {
        // Profile doesn't exist, create one
        const insertProfile: UserProfileInsert = {
          id: userObj.id,
          email: userObj.email || '',
          role: 'citizen'
        }
        const { data: createdRows, error: createError } = await supabase
          .from('user_profiles')
          .insert([insertProfile] as any)
          .select()
          .returns<UserProfile[]>()
        if (createError) {
          // Only log available error properties
          console.error('Failed to create profile:', {
            message: createError.message,
            details: (createError as any).details,
            hint: (createError as any).hint,
            code: (createError as any).code,
            raw: createError
          })
          toast.error(`Failed to create profile: ${createError.message || createError.code || 'Unknown error'}`)
        }
        const createdProfile = Array.isArray(createdRows) && createdRows.length > 0 ? createdRows[0] : null
        if (createdProfile && typeof createdProfile === 'object') {
          setProfile(createdProfile)
          setFormData({ full_name: '', phone: '', address: '' })
        }
      }

      // Get user stats
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('status')
        .eq('citizen_id', userObj.id)
        .returns<Array<Pick<IssueRow, 'status'>>>()
      if (issuesError) {
        console.error('Error fetching issues:', issuesError)
        toast.error(`Error fetching issues: ${issuesError.message || issuesError.code || 'Unknown error'}`)
      }
      if (issuesData) {
        const total = issuesData.length
        const resolved = issuesData.filter((issue: Partial<IssueRow>) => issue.status === 'resolved').length
        const pending = issuesData.filter((issue: Partial<IssueRow>) => issue.status === 'pending').length
        setStats({ totalIssues: total, resolvedIssues: resolved, pendingIssues: pending })
      }
    } catch (error: any) {
      console.error('Failed to fetch user data:', error)
      toast.error(`Failed to load profile data: ${error.message || error.code || 'Unknown error'}`)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (!user?.id) {
        toast.error('Not signed in')
        return
      }
      const now = new Date().toISOString()
      const updateData: UserProfileUpdate = {
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        updated_at: now
      }
      const { error } = await (supabase as any)
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
      if (error) throw error
      setProfile(prev => prev ? { ...prev, ...formData, updated_at: now } : null)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow animate-pulse">
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
              <div className="h-40 bg-gray-300 rounded"></div>
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
          <p className="text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </h1>
                  <p className="text-blue-100 capitalize">
                    {profile?.role || 'citizen'} • Member since {new Date(user.created_at).getFullYear()}
                  </p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="px-8 py-6 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalIssues}</div>
                <div className="text-sm text-gray-500">Total Issues Reported</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.resolvedIssues}</div>
                <div className="text-sm text-gray-500">Issues Resolved</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.pendingIssues}</div>
                <div className="text-sm text-gray-500">Pending Issues</div>
              </div>
            </div>
          </div>
          {/* Profile Information */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {editing && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700">
                    {profile?.full_name || 'Not specified'}
                  </div>
                )}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700">
                    {profile?.phone || 'Not specified'}
                  </div>
                )}
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Account Role
                </label>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700 capitalize">
                  {profile?.role || 'citizen'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Role is managed by administrators</p>
              </div>
            </div>
            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-700">
                  {profile?.address || 'Not specified'}
                </div>
              )}
            </div>
            {/* Account Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Last updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
