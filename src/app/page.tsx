'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'
import AuthForm from '@/components/auth/AuthForm'
import Dashboard from '@/components/Dashboard'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Brain, BookOpen, Users, Timer, Sparkles, CheckCircle, Star, ArrowRight, Play, FileText } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-t-4 border-indigo-600 animate-spin mx-auto"></div>
          </div>
          <p className="text-indigo-600 font-medium">Loading FocusFlow...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Navigation Header */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  FocusFlow
                </h1>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#benefits" className="text-gray-600 hover:text-indigo-600 transition-colors">Benefits</a>
                <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Reviews</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-indigo-200 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered ADHD Education Support</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                  Transform Teaching for
                  <br />
                  ADHD Learners
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Intelligent lesson adaptations, real-time coaching, and visual aids that make learning accessible and engaging for every ADHD student.
                </p>
              </div>
              
              {/* Quick Benefits */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">10-min Setup</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">Evidence-Based</span>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setShowAuthModal(true)}
                variant="gradient" 
                size="xl"
                className="group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="secondary" 
                size="xl"
                className="group"
                onClick={() => {
                  // Scroll to features section
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                <span>See Demo</span>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✨ No credit card required • 5-minute setup • Start teaching better today
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div id="demo" className="bg-gradient-to-br from-indigo-50 to-purple-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              See FocusFlow in Action
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Watch how a simple lesson plan transforms into an ADHD-friendly learning experience
            </p>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-100">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Original Lesson Plan
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                    <p><strong>Topic:</strong> Introduction to Fractions</p>
                    <p><strong>Duration:</strong> 45 minutes</p>
                    <p><strong>Activity:</strong> Read chapter, solve 20 problems, discussion</p>
                    <p className="text-gray-500">Traditional one-size-fits-all approach...</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-xl text-white">
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    ADHD-Adapted Version
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p><strong>Chunked into 3 segments:</strong> 12-15 min each</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p><strong>Visual aids:</strong> Fraction pizza diagrams</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p><strong>Movement breaks:</strong> Every 12 minutes</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p><strong>Engagement hooks:</strong> "Math mystery" storyline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <Button 
                onClick={() => setShowAuthModal(true)}
                variant="gradient" 
                size="lg"
                className="group"
              >
                <span>Try This Transformation</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything Teachers Need
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools designed specifically for ADHD-inclusive classrooms
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Lesson Adaptation</h3>
                  <p className="text-gray-600 mb-4">AI analyzes your lesson plans and creates ADHD-friendly versions with chunked content and engagement points.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• 10-15 minute learning segments</li>
                    <li>• Interactive checkpoints</li>
                    <li>• Visual aid suggestions</li>
                  </ul>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Coaching</h3>
                  <p className="text-gray-600 mb-4">Get instant, context-aware teaching tips based on your lesson content and student needs.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Attention management strategies</li>
                    <li>• Engagement techniques</li>
                    <li>• Behavior redirection tips</li>
                  </ul>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Visual Aid Generator</h3>
                  <p className="text-gray-600 mb-4">AI creates custom educational illustrations to help explain complex concepts visually.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Concept-specific images</li>
                    <li>• Age-appropriate content</li>
                    <li>• Abstract-to-visual mapping</li>
                  </ul>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-6">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Break System</h3>
                  <p className="text-gray-600 mb-4">Age-appropriate break reminders with guided activities to maintain optimal focus.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Grade-level timing</li>
                    <li>• Movement activities</li>
                    <li>• Focus restoration</li>
                  </ul>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-8 rounded-2xl border border-cyan-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
                  <p className="text-gray-600 mb-4">Document student progress and share insights with parents for collaborative support.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Behavioral observations</li>
                    <li>• Academic milestones</li>
                    <li>• Parent communication</li>
                  </ul>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl border border-rose-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Integration</h3>
                  <p className="text-gray-600 mb-4">Works with your existing lesson plans and classroom routines - no disruption required.</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Upload PDF, DOCX, TXT</li>
                    <li>• Copy-paste content</li>
                    <li>• Instant adaptations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div id="benefits" className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Built by Educators, for Educators
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Every feature is designed based on real classroom experiences and ADHD research.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Evidence-Based Strategies</h3>
                      <p className="text-gray-600">All recommendations based on proven ADHD teaching methodologies and research.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Save Hours of Preparation</h3>
                      <p className="text-gray-600">Instantly adapt any lesson plan instead of recreating from scratch.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Better Student Outcomes</h3>
                      <p className="text-gray-600">Improved focus, engagement, and academic performance for ADHD learners.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-indigo-100">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">5 mins</div>
                  <p className="text-gray-600">Average time to adapt a lesson plan</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Traditional method:</span>
                    <span className="font-semibold text-gray-900">2-3 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">With FocusFlow:</span>
                    <span className="font-semibold text-indigo-600">5 minutes</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-900 font-semibold">Time saved:</span>
                    <span className="font-bold text-green-600">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  FocusFlow
                </h3>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering teachers to create inclusive, ADHD-friendly learning experiences
              </p>
              <p className="text-gray-500 text-sm">
                Built with ❤️ for educators and students with ADHD
              </p>
            </div>
          </div>
        </footer>
        
        {/* Auth Modal */}
        <Modal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          size="md"
        >
          <AuthForm onSuccess={() => setShowAuthModal(false)} />
        </Modal>
      </div>
    )
  }

  return <Dashboard />
}