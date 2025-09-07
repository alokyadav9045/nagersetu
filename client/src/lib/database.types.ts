export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          role: 'citizen' | 'admin' | 'authority'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'citizen' | 'admin' | 'authority'
        }
        Update: {
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          role?: 'citizen' | 'admin' | 'authority'
        }
      }
      issues: {
        Row: {
          id: string
          title: string
          description: string
          category_id: number
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
        }
        Insert: {
          title: string
          description: string
          category_id: number
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          images?: string[] | null
          citizen_id: string
          assigned_to?: string | null
        }
        Update: {
          title?: string
          description?: string
          status?: 'pending' | 'in_progress' | 'resolved' | 'rejected'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assigned_to?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
        }
      }
      issue_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
          color: string
          created_at: string
        }
      }
      issue_votes: {
        Row: {
          id: number
          issue_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          issue_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
        }
      }
      issue_comments: {
        Row: {
          id: string
          issue_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          issue_id: string
          user_id: string
          comment: string
        }
      }
    }
  }
}
