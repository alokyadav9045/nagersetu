'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { MapPin, Upload, X, Camera, AlertTriangle, CheckCircle } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

export default function ReportIssuePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    location_address: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
  })
  
  const [images, setImages] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    await Promise.all([
      checkUser(),
      fetchCategories()
    ])
    setPageLoading(false)
  }

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to report an issue')
        router.push('/')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/')
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const getCurrentLocation = async () => {
    setLocationLoading(true)
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      setLocationLoading(false)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setFormData(prev => ({
          ...prev,
          location_lat: lat,
          location_lng: lng
        }))
        
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          )
          
          if (response.ok) {
            const data = await response.json()
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            setFormData(prev => ({
              ...prev,
              location_address: address
            }))
            toast.success('Location detected successfully!')
          } else {
            throw new Error('Geocoding failed')
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setFormData(prev => ({
            ...prev,
            location_address: fallbackAddress
          }))
          toast.info('Location detected, but address lookup failed')
        }
        
        setLocationLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Unable to get your location. '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        
        toast.error(errorMessage)
        setLocationLoading(false)
      },
      options
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploadingImage(true)
    const uploadPromises = []
    
    try {
      for (const file of Array.from(files)) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max size is 5MB.`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file.`)
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `issue-images/${fileName}`

        uploadPromises.push(
          supabase.storage
            .from('images')
            .upload(filePath, file)
            .then(({ data, error }) => {
              if (error) throw error
              
              const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)
              
              return publicUrl
            })
        )
      }

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedUrls.filter(Boolean)])
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`)
      
    } catch (error: any) {
      console.error('Image upload failed:', error)
      toast.error('Failed to upload one or more images')
    } finally {
      setUploadingImage(false)
      // Reset file input
      if (e.target) e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    toast.info('Image removed')
  }

  const validateForm = () => {
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
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category_id: parseInt(formData.category_id),
          priority: formData.priority,
          location_address: formData.location_address.trim(),
          location_lat: formData.location_lat,
          location_lng: formData.location_lng,
          images: images.length > 0 ? images : null,
          citizen_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Issue reported successfully!')
      router.push(`/issue/${data.id}`)
    } catch (error: any) {
      console.error('Failed to report issue:', error)
      toast.error(error.message || 'Failed to report issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to report an issue.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
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
              <select
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
