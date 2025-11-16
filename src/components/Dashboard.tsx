'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import LessonPlanUpload from '@/components/LessonPlanUpload'
import LessonPlanList from '@/components/LessonPlanList'
import LiveCoaching from '@/components/LiveCoaching'
import { LogOut, BookOpen, Brain, Clock, Users, RefreshCw, Upload, BarChart3, Lightbulb, Timer, Bell, Settings, Search, Plus, GraduationCap, Heart, TrendingUp, Zap } from 'lucide-react'

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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FocusFlow
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-gray-900">{profile?.full_name || user?.email?.split('@')[0]}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                {profile?.role === 'teacher' ? (
                  <>
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">Teacher</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">Parent</span>
                  </>
                )}
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <Button variant="secondary" onClick={handleSignOut} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}! 🙋‍♀️
              </h1>
              <p className="text-gray-600">
                Ready to create amazing ADHD-friendly learning experiences?
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={refreshStats}
              disabled={loading}
              className="hidden sm:flex"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.lessonPlans}</p>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2 this week
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Lesson Plans</h3>
              <p className="text-sm text-gray-600">ADHD-adapted lessons</p>
            </div>
          </div>
          
          <div className="group">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.aiTips}</p>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <Zap className="w-3 h-3 mr-1" />
                    AI-powered
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Coaching Tips</h3>
              <p className="text-sm text-gray-600">Real-time suggestions</p>
            </div>
          </div>
          
          <div className="group">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.breakReminders}</p>
                  <div className="flex items-center text-xs text-orange-600 font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    Smart timing
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Break Systems</h3>
              <p className="text-sm text-gray-600">Focus management</p>
            </div>
          </div>
          
          <div className="group">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.visualAids}</p>
                  <div className="flex items-center text-xs text-purple-600 font-medium">
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Visual learning
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Visual Aids</h3>
              <p className="text-sm text-gray-600">Generated illustrations</p>
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