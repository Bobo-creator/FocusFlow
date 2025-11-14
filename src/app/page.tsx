'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'
import AuthForm from '@/components/auth/AuthForm'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 FocusFlow
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered teaching companion for ADHD-friendly education
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">For Teachers</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Upload lesson plans and get ADHD adaptations</li>
                  <li>• Real-time coaching tips during lessons</li>
                  <li>• Auto-generated visual aids</li>
                  <li>• Smart break reminders</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">For Parents</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• View lesson summaries and notes</li>
                  <li>• Track student progress</li>
                  <li>• Collaborate with teachers</li>
                  <li>• Access ADHD resources</li>
                </ul>
              </div>
            </div>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return <Dashboard />
}