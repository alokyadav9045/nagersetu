'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  MapPin, Calendar, User, ThumbsUp, ThumbsDown, MessageCircle, 
  Send, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft,
  Edit, Trash2, Flag, Share2
} from 'lucide-react'
import Image from 'next/image'

interface Issue {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  images: string[] | null
  upvotes: number
  downvotes: number
  citizen_id: string
  assigned_to: string | null
  resolution_note: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  issue_categories: {
    name: string
    color: string
    icon: string
  }
  user_profiles: {
    full_name: string
    email: string
  }
  assigned_user?: {
    full_name: string
    email: string
  }
}

interface Comment {
  id: string
  comment: string
  created_at: string
  user_profiles: {
    full_name: string
    role: string
  }
}

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [voting, setVoting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')

  useEffect(() => {
    if (params.id) {
      initializePage()
    }
  }, [params.id])

  const initializePage = async () => {
    await Promise.all([
      fetchIssue(),
      fetchComments(),
      getUser()
    ])
    setLoading(false)
  }

  const getUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) setUserProfile(profile)
        
        // Get user's vote on this issue
        if (params.id) {
          const { data: vote, error: voteError } = await supabase
            .from('issue_votes')
            .select('vote_type')
            .eq('issue_id', params.id)
            .eq('user_id', user.id)
            .single()
          
          if (vote && 'vote_type' in vote) setUserVote(vote.vote_type as 'upvote' | 'downvote')
        }
      }
    } catch (error) {
      console.error('User fetch failed:', error)
    }
  }

  const fetchIssue = async () => {
    try {
      const { data, error } = await supabase
        .from<Issue>('issues')
        .select(`
          *,
          issue_categories (name, color, icon),
          user_profiles!issues_citizen_id_fkey (full_name, email),
          assigned_user:user_profiles!issues_assigned_to_fkey (full_name, email)
        `)
        .eq('id', String(params.id))
        .single()

      if (error) throw error
      setIssue(data as Issue)
    } catch (error) {
      console.error('Failed to fetch issue:', error)
      toast.error('Issue not found')
      router.push('/')
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from<Comment>('issue_comments')
        .select(`
          *,
          user_profiles (full_name, role)
        `)
        .eq('issue_id', String(params.id))
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data as Comment[] || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    if (!issue) return

    setVoting(true)
    
    try {
      let newUpvotes = issue.upvotes
      let newDownvotes = issue.downvotes
      let newUserVote: 'upvote' | 'downvote' | null = null

      // If user already voted the same way, remove the vote
      if (userVote === voteType) {
        await supabase
          .from('issue_votes')
          .delete()
          .eq('issue_id', String(params.id))
          .eq('user_id', user.id)
        
        // Update vote count
        if (voteType === 'upvote') {
          newUpvotes -= 1
        } else {
          newDownvotes -= 1
        }
        newUserVote = null
      } 
      // If user voted differently before, update the vote
      else if (userVote) {
        await supabase
          .from('issue_votes')
          .update<{ vote_type: 'upvote' | 'downvote' }>({ vote_type: voteType })
          .eq('issue_id', String(params.id))
          .eq('user_id', user.id)
        
        // Update both vote counts
        if (userVote === 'upvote') {
          newUpvotes -= 1
          newDownvotes += 1
        } else {
          newUpvotes += 1
          newDownvotes -= 1
        }
        newUserVote = voteType
      } 
      // First time voting
      else {
        await supabase
          .from('issue_votes')
          .insert<{ issue_id: string; user_id: string; vote_type: 'upvote' | 'downvote' }>([{
            issue_id: String(params.id),
            user_id: user.id,
            vote_type: voteType
          }])
        
        if (voteType === 'upvote') {
          newUpvotes += 1
        } else {
          newDownvotes += 1
        }
        newUserVote = voteType
      }

      // Update issue vote counts in database
      await supabase
        .from('issues')
        .update<{ upvotes: number; downvotes: number }>({ 
          upvotes: newUpvotes, 
          downvotes: newDownvotes 
        })
        .eq('id', String(params.id))

      // Update local state
      setIssue(prev => prev ? {
        ...prev,
        upvotes: newUpvotes,
        downvotes: newDownvotes
      } : null)
      setUserVote(newUserVote)
      
    } catch (error: any) {
      console.error('Failed to vote:', error)
      toast.error('Failed to vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmittingComment(true)
    
    try {
      const { data, error } = await supabase
        .from('issue_comments')
        .insert<{ issue_id: string; user_id: string; comment: string }>([{
          issue_id: String(params.id),
          user_id: user.id,
          comment: newComment.trim()
        }])
        .select(`
          *,
          user_profiles (full_name, role)
        `)
        .single()

      if (error) throw error

      setComments(prev => [...prev, data as Comment])
      setNewComment('')
      toast.success('Comment added successfully!')
    } catch (error: any) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment. Please try again.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const updateIssueStatus = async (status: Issue['status'], note?: string) => {
    if (!userProfile || userProfile.role === 'citizen') {
      toast.error('You do not have permission to update issue status')
      return
    }

    if (!issue) return

    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
        if (note) updates.resolution_note = note
      }

      const { error } = await supabase
        .from('issues')
        .update<Issue>(updates)
        .eq('id', String(params.id))

      if (error) throw error

      setIssue(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Issue status updated successfully!')
      setShowResolutionModal(false)
      setResolutionNote('')
    } catch (error: any) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status. Please try again.')
    }
  }

  const getStatusIcon = (status: Issue['status']) => {
    const icons = {
      pending: Clock,
      in_progress: AlertTriangle,
      resolved: CheckCircle,
      rejected: XCircle
    }
    return icons[status]
  }

  const getStatusColor = (status: Issue['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: Issue['priority']) => {
    const colors = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      urgent: 'text-red-600 bg-red-50'
    }
    return colors[priority]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const shareIssue = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: issue?.title,
          text: issue?.description,
          url: url,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Issue link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy link')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow animate-pulse">
            <div className="h-64 bg-gray-300 rounded-t-lg"></div>
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(issue.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Issue Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="relative">
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={issue.images[currentImageIndex]}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {issue.images.length > 1 && (
                <>
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {issue.images.length}
                  </div>
                  
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {currentImageIndex > 0 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev - 1)}
                        className="bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-75"
                      >
                        ←
                      </button>
                    )}
                    {currentImageIndex < issue.images.length - 1 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev + 1)}
                        className="bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-75"
                      >
                        →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Issue Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                    <StatusIcon className="inline h-4 w-4 mr-1" />
                    {issue.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority.toUpperCase()} PRIORITY
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: issue.issue_categories.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{issue.issue_categories.name}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Reported by {issue.user_profiles.full_name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(issue.created_at)}</span>
                  </div>
                  
                  {issue.location_address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{issue.location_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                {/* Voting */}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                  <button
                    onClick={() => handleVote('upvote')}
                    disabled={voting}
                    className={`p-2 rounded-lg transition-colors ${
                      userVote === 'upvote'
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-green-100 text-green-600'
                    } disabled:opacity-50`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <span className="font-medium text-gray-900">{issue.upvotes}</span>
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                  <button
                    onClick={() => handleVote('downvote')}
                    disabled={voting}
                    className={`p-2 rounded-lg transition-colors ${
                      userVote === 'downvote'
                        ? 'bg-red-500 text-white'
                        : 'hover:bg-red-100 text-red-600'
                    } disabled:opacity-50`}
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                  <span className="font-medium text-gray-900">{issue.downvotes}</span>
                </div>

                <button
                  onClick={shareIssue}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Share issue"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Issue Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
              </div>
            </div>

            {/* Resolution Note */}
            {issue.resolution_note && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Resolution Note
                </h3>
                <p className="text-green-700">{issue.resolution_note}</p>
                {issue.resolved_at && (
                  <p className="text-sm text-green-600 mt-2">
                    Resolved on {formatDate(issue.resolved_at)}
                  </p>
                )}
              </div>
            )}

            {/* Admin Actions */}
            {userProfile && userProfile.role !== 'citizen' && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-4">Admin Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {issue.status !== 'in_progress' && (
                    <button
                      onClick={() => updateIssueStatus('in_progress')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {issue.status !== 'resolved' && (
                    <button
                      onClick={() => setShowResolutionModal(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {issue.status !== 'rejected' && (
                    <button
                      onClick={() => updateIssueStatus('rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Issue
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Comments ({comments.length})
              </h2>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="mb-8">
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || submittingComment}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">Please login to comment on this issue.</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user_profiles.full_name}
                          </span>
                          {comment.user_profiles.role !== 'citizen' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {comment.user_profiles.role}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Issue as Resolved</h3>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add a resolution note (optional)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateIssueStatus('resolved', resolutionNote)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
