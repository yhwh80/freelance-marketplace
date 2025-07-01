import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your existing schema
export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'freelancer' | 'both'
  profile_picture_url?: string
  credits: number
  total_rating: number
  total_jobs_completed: number
  is_recommended: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  client_id: string
  category_id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  cost_credits: number
  status: 'open' | 'closed' | 'completed'
  max_bids: number
  current_bids: number
  selected_professional_id?: string
  completed_at?: string
  created_at: string
  updated_at: string
  accepted_bid_id?: string
}

export interface Bid {
  id: string
  job_id: string
  professional_id: string
  amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface Rating {
  id: string
  job_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  review_text: string
  recommended: boolean
  response_text?: string
  created_at: string
}