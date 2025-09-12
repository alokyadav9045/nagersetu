'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { MapPin, Upload, X, Camera, AlertTriangle, CheckCircle, Droplets, Route, Zap, Trash2, Shield, MoreHorizontal } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

// Default categories used when the database table is missing or empty
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Water Supply', description: 'Water related issues', icon: 'droplets', color: 'blue' },
  { id: 2, name: 'Roads & Infrastructure', description: 'Road and infrastructure issues', icon: 'road', color: 'gray' },
  { id: 3, name: 'Electricity', description: 'Power and electrical issues', icon: 'zap', color: 'yellow' },
  { id: 4, name: 'Waste Management', description: 'Garbage and cleanliness', icon: 'trash-2', color: 'green' },
  { id: 5, name: 'Public Safety', description: 'Safety and security concerns', icon: 'shield', color: 'red' },
  { id: 6, name: 'Other', description: 'Other civic issues', icon: 'more-horizontal', color: 'gray' }
]

interface FormData {
  title: string
  description: string
  category_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location_address: string
  location_lat: number | null
  location_lng: number | null
}

export default function ReportIssuePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true)
  const [dbCategoriesAvailable, setDbCategoriesAvailable] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingIssuesCount, setPendingIssuesCount] = useState(0)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    location_address: '',
    location_lat: null,
    location_lng: null,
  })

  // Initialize page data
  useEffect(() => {
    initializePage()
    checkPendingIssues()
  }, [])

  // Check for pending issues in localStorage
  const checkPendingIssues = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('pending_issue_'))
      setPendingIssuesCount(keys.length)
      if (keys.length > 0) {
        const count = keys.length
        toast.success(`You have ${count} pending issue(s) that will be submitted when the database is available.`, {
          duration: 5000
        })
      }
    } catch (error) {
      console.warn('Error checking pending issues:', error)
    }
  }

  // Try to submit pending issues
  const submitPendingIssues = async () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('pending_issue_'))
      if (keys.length === 0) return

      let successCount = 0
      for (const key of keys) {
        try {
          const issueData = JSON.parse(localStorage.getItem(key) || '{}')
          const { data, error } = await (supabase as any)
            .from('issues')
            .insert([issueData])
            .select()

          if (!error && data) {
            localStorage.removeItem(key)
            successCount++
          }
        } catch (error) {
          console.warn('Failed to submit pending issue:', error)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully submitted ${successCount} pending issue(s)!`)
        // Update the count
        checkPendingIssues()
      }
    } catch (error) {
      console.warn('Error submitting pending issues:', error)
    }
  }

  // Fetch user profile with comprehensive error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      // Make sure user is authenticated
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        throw new Error('User not authenticated')
      }

      // Verify the userId matches the authenticated user
      if (authUser.id !== userId) {
        throw new Error('User ID mismatch - security violation')
      }

      // Query user profile with comprehensive fields (array + limit(1) to avoid 406 on no rows)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role, full_name, email, phone, address, created_at, updated_at')
        .eq('id', userId)
        .limit(1)

      if (error) {
        if (error.message.includes('relation "user_profiles" does not exist')) {
          console.warn('user_profiles table does not exist')
          throw new Error('Database not fully configured. Please contact support.')
        }
        console.error('Profile fetch error:', error)
        throw error
      }

      const profile = Array.isArray(data) && data.length > 0 ? data[0] : null
      if (!profile) {
        console.warn('User profile not found for user:', userId)
        return null
      }
      console.log('User profile fetched successfully:', profile)
      return profile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  // Diagnostic function to check database setup
  const checkDatabaseSetup = async () => {
    if (!user) return false

    try {
      // First test basic Supabase connectivity
      const { error: connError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true })

      if (connError) {
        if (connError.message?.includes('Invalid API key') || 
            connError.message?.includes('JWT') ||
            connError.message?.includes('unauthorized')) {
          toast.error('Supabase configuration error. Please check API keys.')
          return false
        }
        
        if (connError.message?.includes('relation') && connError.message?.includes('does not exist')) {
          toast.error('Database tables not configured. Please set up database schema.')
          return false
        }
      }

      const profile = await fetchUserProfile(user.id)
      
      if (!profile) {
        console.warn('User profile not found, will create one during issue submission')
        toast.success('User profile will be created when you submit your first issue.')
        return false
      }

      console.log('Database setup verified - user profile exists')
      return true
    } catch (error: any) {
      console.warn('Database setup check failed:', error)
      if (error.message.includes('Database not fully configured')) {
        toast.error(error.message)
      } else if (error.message.includes('User not authenticated')) {
        toast.error('Please log in again to continue.')
        router.push('/login')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your internet connection.')
      } else {
        toast.error('Database configuration issue. Please check diagnostic page.')
      }
      return false
    }
  }

  const initializePage = async () => {
    try {
      await checkUser()
      await fetchCategories()
    } catch (error) {
      console.error('Initialization error:', error)
      toast.error('Failed to initialize page')
    } finally {
      setPageLoading(false)
    }
  }

  // Check database setup after user is loaded
  useEffect(() => {
    if (user && !pageLoading) {
      checkDatabaseSetup()
    }
  }, [user, pageLoading])

  // Check user authentication
  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        toast.error('Please login to report an issue')
        router.push('/')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      toast.error('Authentication failed')
      router.push('/')
    }
  }

  // Fetch issue categories
  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const { data, error } = await supabase
        .from('issue_categories')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('Categories fetch error:', error)
        
        // If the table doesn't exist, provide default categories
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('Categories table does not exist, using default categories')
          setCategories(DEFAULT_CATEGORIES)
          setDbCategoriesAvailable(false)
          toast.error('Database not fully set up. Using default categories.')
          return
        }
        
        throw error
      }
      if (data && data.length > 0) {
        setCategories(data)
        setDbCategoriesAvailable(true)
      } else {
        console.log('No categories found in database, using defaults')
        setCategories(DEFAULT_CATEGORIES)
        setDbCategoriesAvailable(false)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories. Using defaults.')
      
      // Provide fallback categories
      setCategories(DEFAULT_CATEGORIES)
      setDbCategoriesAvailable(false)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser. Please enter your address manually.')
      return
    }

    setLocationLoading(true)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout
      maximumAge: 60000 // Use cached location if recent
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      setFormData(prev => ({
        ...prev,
        location_lat: lat,
        location_lng: lng
      }))
      
      // Try multiple geocoding services as fallbacks
      let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      
      try {
        // Primary: BigDataCloud (free, no API key required)
        const response1 = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          { signal: AbortSignal.timeout(10000) }
        )
        
        if (response1.ok) {
          const data = await response1.json()
          address = data.display_name || 
                   `${data.locality || ''} ${data.city || ''} ${data.principalSubdivision || ''} ${data.countryName || ''}`.trim() ||
                   address
        } else {
          throw new Error('Primary geocoding failed')
        }
      } catch (geocodingError) {
        console.warn('Primary geocoding failed, trying fallback:', geocodingError)
        
        try {
          // Fallback: OpenCage (requires API key in production)
          const response2 = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=demo&limit=1`,
            { signal: AbortSignal.timeout(10000) }
          )
          
          if (response2.ok) {
            const data = await response2.json()
            if (data.results && data.results.length > 0) {
              address = data.results[0].formatted || address
            }
          }
        } catch (fallbackError) {
          console.warn('Fallback geocoding also failed:', fallbackError)
          // Keep coordinate-based address
        }
      }
      
      setFormData(prev => ({
        ...prev,
        location_address: address
      }))
      
      if (address.includes(',') && !address.match(/^\d+\.\d+,\s*\d+\.\d+$/)) {
        toast.success('Location detected and address found!')
      } else {
        toast.success('Location detected! You can edit the address if needed.')
      }
      
    } catch (error: any) {
      console.error('Geolocation error:', error)
      let errorMessage = 'Unable to get your location: '
      
      if (error.code) {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location permissions and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please enter your address manually.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter address manually.'
            break
          default:
            errorMessage += 'An unknown error occurred. Please enter your address manually.'
            break
        }
      } else {
        errorMessage += 'Please enter your address manually.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLocationLoading(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploadingImage(true)
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB.`)
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not a valid image file.`)
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `issue-images/${fileName}`

        try {
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (error) {
            // Handle storage bucket not found or other storage errors
            if (error.message.includes('not found') || error.message.includes('does not exist')) {
              console.warn('Storage bucket not configured, converting to base64')
              // Fallback to base64 for demo purposes
              return new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(file)
              })
            }
            throw new Error(`Failed to upload ${file.name}: ${error.message}`)
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

          return urlData.publicUrl
        } catch (storageError: any) {
          console.warn('Storage upload failed, using base64 fallback:', storageError)
          // Fallback to base64 encoding
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedUrls.filter(Boolean)])
      
      const hasBase64 = uploadedUrls.some(url => url.startsWith('data:'))
      if (hasBase64) {
        toast.success(`${uploadedUrls.length} image(s) processed successfully! (Note: Using local storage as backup)`)
      } else {
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`)
      }
      
    } catch (error: any) {
      console.error('Image upload failed:', error)
      toast.error(error.message || 'Failed to upload one or more images')
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (e.target) e.target.value = ''
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    toast.success('Image removed')
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category'
    }
    
    if (!formData.location_address.trim()) {
      newErrors.location_address = 'Location is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    if (!user) {
      toast.error('Authentication required')
      return
    }

    setLoading(true)

    try {
      // First, ensure user profile exists
      await ensureUserProfile()

      const categoryIdToSend = dbCategoriesAvailable ? parseInt(formData.category_id) : null
      const issueData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: categoryIdToSend,
        priority: formData.priority,
        location_address: formData.location_address.trim(),
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        images: images.length > 0 ? images : null,
        citizen_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await (supabase as any)
        .from('issues')
        .insert([issueData as any])
        .select()
        .single()

      if (error) {
        // Handle specific database errors
        if (error.message.includes('relation "issues" does not exist')) {
          toast.error('Database not set up properly. Please contact support or visit diagnostic page.')
          console.warn('Issues table does not exist. Issue data:', issueData)
          // Store locally as fallback
          localStorage.setItem(`pending_issue_${Date.now()}`, JSON.stringify(issueData))
          setPendingIssuesCount(prev => prev + 1)
          toast.success('Issue saved locally and will be submitted when database is available.')
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            category_id: '',
            priority: 'medium',
            location_address: '',
            location_lat: null,
            location_lng: null
          })
          setImages([])
          setErrors({})
          return
        }

        // Handle foreign key constraint violation
        if (error.code === '23503' && error.message.includes('issue_categories')) {
          toast.error('Categories are not configured in the database. Issue saved locally; please seed categories and submit pending.')
          localStorage.setItem(`pending_issue_${Date.now()}`, JSON.stringify(issueData))
          setPendingIssuesCount(prev => prev + 1)
          // Reset form
          setFormData({
            title: '',
            description: '',
            category_id: '',
            priority: 'medium',
            location_address: '',
            location_lat: null,
            location_lng: null
          })
          setImages([])
          setErrors({})
          return
        }

        if (error.code === '23503' && error.message.includes('citizen_id_fkey')) {
          toast.error('User profile error. Please contact support.')
          console.warn('Foreign key constraint violation - user profile missing:', error)
          // Store locally as fallback
          localStorage.setItem(`pending_issue_${Date.now()}`, JSON.stringify(issueData))
          setPendingIssuesCount(prev => prev + 1)
          toast.success('Issue saved locally and will be submitted when user profile is fixed.')
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            category_id: '',
            priority: 'medium',
            location_address: '',
            location_lat: null,
            location_lng: null
          })
          setImages([])
          setErrors({})
          return
        }
        
        throw error
      }

      toast.success('Issue reported successfully!')
      router.push(`/issue/${(data as any).id}`)
      
    } catch (error: any) {
      console.error('Failed to report issue:', error)
      
      // Provide specific error messages
      if (error.code === '23503') {
        if (error.message.includes('citizen_id_fkey')) {
          toast.error('User profile not found. Issue saved locally for later submission.')
          // Store locally as fallback
          const issueData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category_id: parseInt(formData.category_id),
            priority: formData.priority,
            location_address: formData.location_address.trim(),
            location_lat: formData.location_lat,
            location_lng: formData.location_lng,
            images: images.length > 0 ? images : null,
            citizen_id: user.id,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          localStorage.setItem(`pending_issue_${Date.now()}`, JSON.stringify(issueData))
          setPendingIssuesCount(prev => prev + 1)
          
          // Reset form
          setFormData({
            title: '',
            description: '',
            category_id: '',
            priority: 'medium',
            location_address: '',
            location_lat: null,
            location_lng: null
          })
          setImages([])
          setErrors({})
          return
        } else {
          toast.error('Invalid category selected. Please choose a valid category.')
        }
      } else if (error.code === '23502') {
        toast.error('Missing required fields. Please fill in all required information.')
      } else if (error.code === '42501' || (typeof error.message === 'string' && error.message.includes('row-level security'))) {
        toast.error('Your account does not have permission to create issues. Please contact admin or fix RLS policies.')
      } else if (error.message.includes('permission denied') || error.message.includes('authentication')) {
        toast.error('You do not have permission to create issues. Please check your account status.')
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error(error.message || 'Failed to report issue. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Ensure user profile exists before creating issue
  const ensureUserProfile = async () => {
    if (!user) return

    try {
      // Check if user profile exists using our comprehensive function
      const existingProfile = await fetchUserProfile(user.id)

      if (!existingProfile) {
        // Profile doesn't exist, create it
        console.log('Creating user profile for:', user.id)
        const { data: insertData, error: insertError } = await (supabase as any)
          .from('user_profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              role: 'citizen',
              phone: user.user_metadata?.phone || null,
              address: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()

        if (insertError) {
          console.warn('Failed to create user profile:', insertError)
          throw new Error(`Failed to create user profile: ${insertError.message}`)
        } else {
          console.log('User profile created successfully:', insertData)
          toast.success('User profile created successfully!')
        }
      } else {
        console.log('User profile already exists:', existingProfile)
      }
    } catch (error: any) {
      console.warn('Error ensuring user profile:', error)
      
      if (error.message.includes('Database not fully configured')) {
        throw error // Re-throw database configuration errors
      }
      
      // For other errors, we'll try to continue - the main submission will handle constraint errors
      console.warn('Continuing despite profile check error...')
    }
  }

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to report an issue.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  function renderCategoryIcon(cat: { icon: string }) {
    const cls = 'h-4 w-4'
    switch (cat.icon) {
      case 'droplets':
        return <Droplets className={cls} />
      case 'road':
        return <Route className={cls} />
      case 'zap':
        return <Zap className={cls} />
      case 'trash-2':
        return <Trash2 className={cls} />
      case 'shield':
        return <Shield className={cls} />
      case 'more-horizontal':
        return <MoreHorizontal className={cls} />
      default:
        return <AlertTriangle className={cls} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Civic Issue</h1>
            <p className="text-gray-600">Help improve your community by reporting civic issues</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a brief, descriptive title"
                maxLength={100}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.category_id}
                onValueChange={(val) => handleInputChange('category_id', val)}
                disabled={categoriesLoading}
                required
              >
                <SelectTrigger className={`${errors.category_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={categoriesLoading ? 'Loading categories…' : 'Select a category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <span className="inline-flex items-center gap-2">
                        {renderCategoryIcon(cat)}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              {formData.category_id && (() => {
                const selected = categories.find(c => c.id.toString() === formData.category_id)
                return selected ? (
                  <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                    {renderCategoryIcon(selected)}
                    <span>{selected.description}</span>
                  </div>
                ) : null
              })()}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as FormData['priority'])}
              >
                <option value="low">🟢 Low - Minor issue, not urgent</option>
                <option value="medium">🟡 Medium - Moderate issue</option>
                <option value="high">🟠 High - Significant issue</option>
                <option value="urgent">🔴 Urgent - Immediate attention required</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the issue, including when you noticed it and how it affects the community"
                maxLength={1000}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location_address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.location_address}
                    onChange={(e) => handleInputChange('location_address', e.target.value)}
                    placeholder="Enter the location address or description"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Detecting location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      <span>Use my current location</span>
                    </>
                  )}
                </button>
              </div>
              {errors.location_address && <p className="text-red-500 text-sm mt-1">{errors.location_address}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage || images.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    uploadingImage || images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {uploadingImage ? 'Uploading images...' : 
                     images.length >= 5 ? 'Maximum 5 images reached' :
                     'Click to upload images or drag and drop'}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each (Max 5 images)
                  </span>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Images ({images.length}/5)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {/* Show pending issues button if any exist */}
              {pendingIssuesCount > 0 && (
                <button
                  type="button"
                  onClick={submitPendingIssues}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Submit Pending ({pendingIssuesCount})
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Report Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
