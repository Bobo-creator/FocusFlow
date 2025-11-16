'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import LessonPlanUpload from '@/components/LessonPlanUpload'
import LessonPlanList from '@/components/LessonPlanList'
import LiveCoaching from '@/components/LiveCoaching'
import { LogOut, BookOpen, Brain, Clock, Users, RefreshCw } from 'lucide-react'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('upload')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    lessonPlans: 0,
    aiTips: 0,
    breakReminders: 0,
    visualAids: 0
  })
  const supabase = createClientSupabase()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
        
        // Fetch stats after getting user profile
        await fetchStats(user.id)
      }
      setLoading(false)
    }

    getProfile()
  }, [supabase])

  const fetchStats = async (userId: string) => {
    try {
      // First get user's lesson plan IDs
      const { data: lessonPlans } = await supabase
        .from('lesson_plans')
        .select('id')
        .eq('teacher_id', userId)

      const lessonPlanIds = lessonPlans?.map(lp => lp.id) || []

      // Fetch lesson plans count
      const { count: lessonCount } = await supabase
        .from('lesson_plans')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', userId)

      // Fetch coaching tips count for user's lessons
      let tipsCount = 0
      if (lessonPlanIds.length > 0) {
        const { count } = await supabase
          .from('coaching_tips')
          .select('*', { count: 'exact', head: true })
          .in('lesson_plan_id', lessonPlanIds)
        tipsCount = count || 0
      }

      // Fetch break reminders count for user's lessons
      let breakCount = 0
      if (lessonPlanIds.length > 0) {
        const { count } = await supabase
          .from('break_reminders')
          .select('*', { count: 'exact', head: true })
          .in('lesson_plan_id', lessonPlanIds)
        breakCount = count || 0
      }

      // Fetch visualizers count for user's lessons
      let visualCount = 0
      if (lessonPlanIds.length > 0) {
        const { count } = await supabase
          .from('visualizers')
          .select('*', { count: 'exact', head: true })
          .in('lesson_plan_id', lessonPlanIds)
        visualCount = count || 0
      }

      setStats({
        lessonPlans: lessonCount || 0,
        aiTips: tipsCount,
        breakReminders: breakCount,
        visualAids: visualCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshStats = async () => {
    if (user?.id) {
      await fetchStats(user.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">🎯 FocusFlow</h1>
              <span className="ml-4 text-gray-600">
                Welcome back, {profile?.full_name || user?.email}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {profile?.role === 'teacher' ? '👩‍🏫 Teacher' : '👨‍👩‍👧‍👦 Parent'}
              </span>
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={refreshStats}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Lesson Plans</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.lessonPlans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">AI Tips Generated</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.aiTips}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Break Reminders</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.breakReminders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Visual Aids</h3>
                <p className="text-2xl font-semibold text-gray-900">{stats.visualAids}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {profile?.role === 'teacher' && (
              <>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'upload'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upload Lesson Plan
                </button>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'lessons'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Lesson Plans
                </button>
                <button
                  onClick={() => setActiveTab('coaching')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'coaching'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Live Coaching
                </button>
              </>
            )}
            {profile?.role === 'parent' && (
              <button
                onClick={() => setActiveTab('student-progress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'student-progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Student Progress
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === 'upload' && profile?.role === 'teacher' && (
            <LessonPlanUpload userId={user?.id} />
          )}
          
          {activeTab === 'lessons' && profile?.role === 'teacher' && (
            <LessonPlanList userId={user?.id} />
          )}
          
          {activeTab === 'coaching' && profile?.role === 'teacher' && (
            <LiveCoaching userId={user?.id} />
          )}
          
          {activeTab === 'student-progress' && profile?.role === 'parent' && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Student Progress</h3>
              <p className="text-gray-500">
                View your child's lesson summaries and teacher notes here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}