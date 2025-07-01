'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostJobPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    category: ''
  })

  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth?type=client')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        if (userData.role === 'freelancer') {
          router.push('/dashboard/freelancer')
          return
        }
        setUser(userData)
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Check credits
    if (user.credits < 5) {
      setMessage('Insufficient credits. You need 5 credits to post a job.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      // Get a random category_id (you might want to implement proper categories)
      const dummyCategoryId = 'dae11672-57b1-40f3-8387-a2241911e151'

      // Create job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: user.id,
          category_id: dummyCategoryId,
          title: formData.title,
          description: formData.description,
          budget_min: Math.round(parseFloat(formData.budget_min) * 100), // Convert to pence
          budget_max: Math.round(parseFloat(formData.budget_max) * 100), // Convert to pence
          cost_credits: 5,
          status: 'open',
          max_bids: 3,
          current_bids: 0
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Deduct credits
      const { error: creditError } = await supabase
        .from('users')
        .update({ credits: user.credits - 5 })
        .eq('id', user.id)

      if (creditError) throw creditError

      setMessage('Job posted successfully!')
      
      // Redirect to job page
      setTimeout(() => {
        router.push(`/jobs/${jobData.id}`)
      }, 2000)

    } catch (error: any) {
      setMessage(error.message || 'Failed to post job')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
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
              <span className="font-medium text-gray-600">Post a Job</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard/client" className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <div className="text-sm text-gray-600">
                Credits: <span className="font-medium">{user.credits}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Tell us about your project and find the perfect freelancer</p>
        </div>

        {/* Credit Warning */}
        {user.credits < 5 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Insufficient Credits</h3>
                <p className="text-red-700">You need 5 credits to post a job. You currently have {user.credits} credits.</p>
                <Link href="/buy-credits" className="text-red-600 hover:text-red-800 font-medium">
                  Buy more credits →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-blue-800">
              <span className="text-xl mr-2">💰</span>
              <span>Posting this job will cost <strong>5 credits</strong>. You have <strong>{user.credits} credits</strong> available.</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Build a WordPress website for my business"
              />
              <p className="text-sm text-gray-500 mt-1">Be specific and descriptive</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your project in detail. Include requirements, timeline, and any specific technologies or skills needed..."
              />
              <p className="text-sm text-gray-500 mt-1">The more details you provide, the better proposals you'll receive</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Budget (£) *
                </label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget (£) *
                </label>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500.00"
                />
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Important Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Your job will receive a maximum of <strong>3 proposals</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Job posting costs <strong>5 credits</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>You can review all proposals before making a decision</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Job automatically closes when 3 proposals are received</span>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-sm ${
                message.includes('success') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex items-center justify-between pt-6">
              <Link
                href="/dashboard/client"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Dashboard
              </Link>

              <button
                type="submit"
                disabled={submitting || user.credits < 5}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting Job...' : 'Post Job (5 Credits)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}