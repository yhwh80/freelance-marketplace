'use client'

import { useState, useEffect } from 'react'
import { supabase, Job } from '@/lib/supabase'
import Link from 'next/link'

interface JobWithClient extends Job {
  users: {
    name: string
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadJobs()
  }, [filter])

  async function loadJobs() {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          users!jobs_client_id_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (filter === 'open') {
        query = query.eq('status', 'open')
      }

      const { data } = await query

      if (data) {
        setJobs(data as JobWithClient[])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
              <span className="font-medium text-gray-600">Browse Jobs</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-gray-600 hover:text-blue-600 font-medium">
                Sign in
              </Link>
              <Link href="/auth?signup=true" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join now
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find the perfect project for your skills</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'open'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Open ({jobs.filter(job => job.status === 'open').length})
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'open' ? 'bg-green-100 text-green-800' :
                          job.status === 'closed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{job.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span className="font-medium text-gray-900">
                          £{(job.budget_min / 100).toLocaleString()} - £{(job.budget_max / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📋</span>
                        <span>{job.current_bids}/{job.max_bids} proposals</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>👤</span>
                        <span>Posted by {job.users?.name || 'Client'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🕒</span>
                        <span>{getTimeAgo(job.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {job.current_bids >= job.max_bids ? (
                        <span className="text-red-600 font-medium">Maximum bids reached</span>
                      ) : job.status === 'open' ? (
                        <span className="text-green-600 font-medium">Accepting proposals</span>
                      ) : (
                        <span className="text-gray-500">Closed for bidding</span>
                      )}
                    </div>
                    
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA for non-users */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to start bidding?</h3>
          <p className="text-blue-100 mb-6">Join RecommendUsUK and get 10 free credits to submit your first proposals</p>
          <Link
            href="/auth?type=freelancer"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Join as Freelancer
          </Link>
        </div>
      </div>
    </div>
  )
}