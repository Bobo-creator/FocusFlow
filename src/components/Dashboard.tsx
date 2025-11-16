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
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-2xl p-1">
            <nav className="flex space-x-1">
              {profile?.role === 'teacher' && (
                <>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'upload'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Lesson</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('lessons')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'lessons'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>My Lessons</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coaching')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'coaching'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>Live Coaching</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'analytics'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </button>
                </>
              )}
              {profile?.role === 'parent' && (
                <>
                  <button
                    onClick={() => setActiveTab('student-progress')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'student-progress'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Student Progress</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === 'resources'
                        ? 'bg-white shadow-md text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>ADHD Resources</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          {activeTab === 'upload' && profile?.role === 'teacher' && (
            <div className="p-8">
              <LessonPlanUpload userId={user?.id} />
            </div>
          )}
          
          {activeTab === 'lessons' && profile?.role === 'teacher' && (
            <div className="p-8">
              <LessonPlanList userId={user?.id} />
            </div>
          )}
          
          {activeTab === 'coaching' && profile?.role === 'teacher' && (
            <div className="p-8">
              <LiveCoaching userId={user?.id} />
            </div>
          )}
          
          {activeTab === 'analytics' && profile?.role === 'teacher' && (
            <div className="p-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Track your teaching impact and student engagement metrics.
                </p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 max-w-sm mx-auto">
                  <p className="text-sm text-indigo-700 font-medium">Coming Soon!</p>
                  <p className="text-xs text-indigo-600 mt-1">Advanced analytics and insights</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'student-progress' && profile?.role === 'parent' && (
            <div className="p-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Student Progress</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  View your child's lesson summaries, teacher notes, and learning progress.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-sm mx-auto">
                  <p className="text-sm text-blue-700 font-medium">Connect with Teachers</p>
                  <p className="text-xs text-blue-600 mt-1">Ask your teacher for access to view progress</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'resources' && profile?.role === 'parent' && (
            <div className="p-8">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">ADHD Resources</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Access helpful resources, tips, and strategies for supporting ADHD learners at home.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-sm mx-auto">
                  <p className="text-sm text-green-700 font-medium">Resource Library</p>
                  <p className="text-xs text-green-600 mt-1">Coming soon with expert guidance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}