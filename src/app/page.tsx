'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Job, User } from '@/lib/supabase'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalFreelancers: 0,
    totalClients: 0,
    completedJobs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get recent jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3)

      // Get stats
      const { data: usersData } = await supabase
        .from('users')
        .select('role, total_jobs_completed')

      const { data: allJobsData } = await supabase
        .from('jobs')
        .select('status')

      if (jobsData) setJobs(jobsData)
      
      if (usersData && allJobsData) {
        const freelancers = usersData.filter(u => u.role === 'freelancer' || u.role === 'both').length
        const clients = usersData.filter(u => u.role === 'client' || u.role === 'both').length
        const completed = allJobsData.filter(j => j.status === 'completed').length

        setStats({
          totalJobs: allJobsData.length,
          totalFreelancers: freelancers,
          totalClients: clients,
          completedJobs: completed
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold text-gray-800">RecommendUsUK</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Find work
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                How it works
              </Link>
              <Link href="/auth" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Log in
              </Link>
              <Link href="/auth?signup=true" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Sign up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Hire professionals or find work
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            Post your project and get quotes from skilled UK professionals, or browse jobs and submit proposals.
          </p>

          {/* Quick Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input 
                type="text" 
                placeholder="What service do you need?"
                className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
          
          {/* Two Main User Paths */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Hire Professionals */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">💼</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Hire Professionals</h3>
              <p className="text-gray-600 mb-6">Post your project and get quotes from skilled freelancers</p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>25 free credits to get started</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Maximum 3 quotes per job</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Only 5 credits per job post</span>
                </li>
              </ul>
              <Link 
                href="/auth?type=client" 
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Post a Project
              </Link>
            </div>

            {/* Find Work */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Find Work</h3>
              <p className="text-gray-600 mb-6">Browse projects and submit proposals to clients</p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>10 free credits to start bidding</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Quality projects from real clients</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Build your reputation with reviews</span>
                </li>
              </ul>
              <Link 
                href="/auth?type=freelancer" 
                className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Find Projects
              </Link>
            </div>
          </div>

          {/* Simple Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalJobs}</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalFreelancers}</div>
              <div className="text-sm text-gray-600">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.completedJobs}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-xl font-bold">RecommendUsUK</span>
            </div>
            <p className="text-gray-400 mb-6">The UK's trusted freelance marketplace</p>
            <div className="flex justify-center space-x-6">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
