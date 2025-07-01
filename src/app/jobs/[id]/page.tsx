'use client'

import { useState, useEffect } from 'react'
import { supabase, Job, Bid } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface JobWithClient extends Job {
  users: {
    name: string
  }
}

interface BidWithUser extends Bid {
  users: {
    name: string
    total_rating: number
    is_recommended: boolean
  }
}

export default function JobDetailPage() {
  const [job, setJob] = useState<JobWithClient | null>(null)
  const [bids, setBids] = useState<BidWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  useEffect(() => {
    loadJobData()
    checkUser()
  }, [jobId])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setUser(userData)
    }
  }

  async function loadJobData() {
    try {
      // Load job details
      const { data: jobData } = await supabase
        .from('jobs')
        .select(`
          *,
          users!jobs_client_id_fkey(name)
        `)
        .eq('id', jobId)
        .single()

      if (jobData) {
        setJob(jobData as JobWithClient)
      }

      // Load bids
      const { data: bidsData } = await supabase
        .from('bids')
        .select(`
          *,
          users!bids_professional_id_fkey(name, total_rating, is_recommended)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (bidsData) {
        setBids(bidsData as BidWithUser[])
      }
    } catch (error) {
      console.error('Error loading job:', error)
    } finally {
      setLoading(false)
    }
  }

  async function submitBid(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      router.push('/auth?type=freelancer')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      // Check if user already bid
      const existingBid = bids.find(bid => bid.professional_id === user.id)
      if (existingBid) {
        setMessage('You have already submitted a proposal for this job.')
        setSubmitting(false)
        return
      }

      // Check if max bids reached
      if (job && bids.length >= job.max_bids) {
        setMessage('This job has reached the maximum number of proposals.')
        setSubmitting(false)
        return
      }

      // Submit bid
      const { error } = await supabase
        .from('bids')
        .insert({
          job_id: jobId,
          professional_id: user.id,
          amount: Math.round(parseFloat(bidAmount) * 100), // Convert to pence
          message: bidMessage,
          status: 'pending'
        })

      if (error) throw error

      // Update job bid count
      const newBidCount = bids.length + 1
      await supabase
        .from('jobs')
        .update({ 
          current_bids: newBidCount,
          status: newBidCount >= (job?.max_bids || 3) ? 'closed' : 'open'
        })
        .eq('id', jobId)

      setMessage('Proposal submitted successfully!')
      setBidAmount('')
      setBidMessage('')
      
      // Reload data
      loadJobData()
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit proposal')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h1>
          <Link href="/jobs" className="text-blue-600 hover:text-blue-800">← Back to jobs</Link>
        </div>
      </div>
    )
  }

  const userBid = user ? bids.find(bid => bid.professional_id === user.id) : null
  const canBid = user && user.role !== 'client' && !userBid && job.status === 'open' && bids.length < job.max_bids

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-lg font-bold text-gray-800">RecommendUsUK</span>
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600">Browse Jobs</Link>
              <span className="text-gray-400">|</span>
              <span className="font-medium text-gray-600">Job Details</span>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link href={`/dashboard/${user.role === 'client' ? 'client' : 'freelancer'}`} className="text-gray-600 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth" className="text-gray-600 hover:text-blue-600 font-medium">
                    Sign in
                  </Link>
                  <Link href="/auth?signup=true" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Join now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Posted by {job.users?.name || 'Client'}</span>
                    <span>•</span>
                    <span>{formatDate(job.created_at)}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'open' ? 'bg-green-100 text-green-800' :
                  job.status === 'closed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    £{(job.budget_min / 100).toLocaleString()} - £{(job.budget_max / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Budget Range</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {job.current_bids}/{job.max_bids}
                  </div>
                  <div className="text-sm text-gray-600">Proposals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {job.cost_credits}
                  </div>
                  <div className="text-sm text-gray-600">Credits Cost</div>
                </div>
              </div>
            </div>

            {/* Proposals */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Proposals ({bids.length})
              </h2>

              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-600">No proposals submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {bid.users?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{bid.users?.name || 'Freelancer'}</div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>⭐ {bid.users?.total_rating.toFixed(1) || '0.0'}</span>
                              {bid.users?.is_recommended && (
                                <span className="text-green-600">✓ Recommended</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            £{(bid.amount / 100).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(bid.created_at)}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{bid.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Bid Form */}
            {user ? (
              canBid ? (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Proposal</h3>
                  
                  <form onSubmit={submitBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Bid Amount (£)
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your bid amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proposal Message
                      </label>
                      <textarea
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Explain why you're the best choice for this project..."
                      />
                    </div>

                    {message && (
                      <div className={`p-3 rounded-lg text-sm ${
                        message.includes('success') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </form>
                </div>
              ) : userBid ? (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Proposal</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold text-blue-900 mb-2">
                      £{(userBid.amount / 100).toLocaleString()}
                    </div>
                    <p className="text-blue-700 text-sm">{userBid.message}</p>
                    <div className="mt-2 text-xs text-blue-600">
                      Status: {userBid.status}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Cannot Bid</h3>
                  <p className="text-gray-600 text-sm">
                    {job.status !== 'open' ? 'This job is no longer accepting proposals.' :
                     bids.length >= job.max_bids ? 'Maximum number of proposals reached.' :
                     'You cannot bid on this job.'}
                  </p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Want to bid?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Sign up to submit proposals and start earning
                </p>
                <Link
                  href="/auth?type=freelancer"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Join as Freelancer
                </Link>
              </div>
            )}

            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">{formatDate(job.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposals</span>
                  <span className="font-medium">{job.current_bids}/{job.max_bids}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{job.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client</span>
                  <span className="font-medium">{job.users?.name || 'Anonymous'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}