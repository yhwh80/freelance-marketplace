'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sessionVerified, setSessionVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    checkUser()
    if (sessionId) {
      verifyPayment()
    }
  }, [sessionId])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  async function verifyPayment() {
    if (!sessionId) return

    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        setSessionVerified(true)
        // Refresh user data to get updated credits
        setTimeout(() => {
          checkUser()
        }, 2000)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    }
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
              <span className="font-medium text-gray-600">Payment Successful</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/${user.role === 'client' ? 'client' : 'freelancer'}`} className="text-gray-600 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <div className="text-sm text-gray-600">
                Credits: <span className="font-medium">{user.credits}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. Your credits have been added to your account.
          </p>

          {sessionVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Payment Verified</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                Your credits have been successfully added to your account
              </p>
            </div>
          )}

          {/* Current Credits */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {user.credits}
              </div>
              <div className="text-gray-600">
                Current Credits
              </div>
              <div className="text-sm text-gray-500 mt-2">
                You can post {Math.floor(user.credits / 5)} jobs
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/post-job"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href={`/dashboard/${user.role === 'client' ? 'client' : 'freelancer'}`}
              className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/buy-credits"
              className="text-blue-600 hover:text-blue-800 font-medium px-8 py-3"
            >
              Buy More Credits
            </Link>
          </div>

          {/* Receipt Info */}
          {sessionId && (
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Transaction ID: {sessionId.substring(0, 20)}...
              </p>
              <p className="text-gray-500 text-sm mt-1">
                A receipt has been sent to your email address
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}