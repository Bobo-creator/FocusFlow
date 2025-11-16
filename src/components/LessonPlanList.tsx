'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import BreakReminderSystem from '@/components/BreakReminderSystem'
import { BookOpen, Brain, Clock, Eye, Trash2, Image, Play, Layers, Palette, RefreshCw, ArrowRight, CheckCircle, Sparkles, BarChart3 } from 'lucide-react'

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade_level: string
  original_content: string
  adhd_adapted_content: string | null
  created_at: string
}

interface Visualizer {
  id: string
  concept: string
  image_url: string
  description: string
  created_at: string
  signedUrl?: string
}

interface LessonPlanListProps {
  userId?: string
}

export default function LessonPlanList({ userId }: LessonPlanListProps) {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'original' | 'adapted' | 'visual-aids' | 'coaching'>('overview')
  const [showCoaching, setShowCoaching] = useState(false)
  const [generatingVisual, setGeneratingVisual] = useState(false)
  const [visualizers, setVisualizers] = useState<Visualizer[]>([])
  const [loadingVisualizers, setLoadingVisualizers] = useState(false)
  const supabase = createClientSupabase()

  useEffect(() => {
    if (userId) {
      fetchLessonPlans()
    }
  }, [userId])

  useEffect(() => {
    if (selectedPlan) {
      fetchVisualizers(selectedPlan.id)
    } else {
      setVisualizers([])
    }
  }, [selectedPlan])

  const fetchLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLessonPlans(data || [])
    } catch (error) {
      console.error('Error fetching lesson plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVisualizers = async (lessonPlanId: string) => {
    setLoadingVisualizers(true)
    try {
      const { data, error } = await supabase
        .from('visualizers')
        .select('*')
        .eq('lesson_plan_id', lessonPlanId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Generate signed URLs for the images
      const visualizersWithSignedUrls = await Promise.all(
        (data || []).map(async (visualizer) => {
          try {
            // Extract the file path from the full URL
            let filePath = visualizer.image_url
            
            // If it's already a full URL, extract just the path
            if (filePath.includes('supabase')) {
              const urlParts = filePath.split('/storage/v1/object/public/visualizers/')
              if (urlParts.length > 1) {
                filePath = urlParts[1]
              } else {
                const pathMatch = filePath.match(/visualizers\/(.+)$/)
                if (pathMatch) {
                  filePath = pathMatch[1]
                }
              }
            }
            
            // Generate signed URL
            const { data: signedUrlData } = await supabase.storage
              .from('visualizers')
              .createSignedUrl(filePath, 3600) // 1 hour expiry
            
            return {
              ...visualizer,
              signedUrl: signedUrlData?.signedUrl || visualizer.image_url
            }
          } catch (urlError) {
            console.warn('Could not generate signed URL for', visualizer.image_url, urlError)
            return {
              ...visualizer,
              signedUrl: visualizer.image_url
            }
          }
        })
      )
      
      setVisualizers(visualizersWithSignedUrls)
    } catch (error) {
      console.error('Error fetching visualizers:', error)
    } finally {
      setLoadingVisualizers(false)
    }
  }

  const deleteLessonPlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson plan?')) return

    try {
      const { error } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setLessonPlans(lessonPlans.filter(plan => plan.id !== id))
      if (selectedPlan?.id === id) {
        setSelectedPlan(null)
      }
    } catch (error) {
      console.error('Error deleting lesson plan:', error)
    }
  }

  const startLiveCoaching = () => {
    setShowCoaching(true)
  }

  const generateVisuals = async () => {
    if (!selectedPlan) return
    
    setGeneratingVisual(true)
    try {
      // Extract concepts from the lesson content for visual generation
      const concepts = extractConcepts(selectedPlan.original_content)
      
      for (const concept of concepts.slice(0, 2)) { // Limit to 2 visuals
        const response = await fetch('/api/generate-visualizer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonPlanId: selectedPlan.id,
            concept: concept,
            gradeLevel: selectedPlan.grade_level,
            description: `Visual aid for ${concept} in ${selectedPlan.subject}`
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to generate visual')
        }
      }
      
      // Refresh visualizers to show new ones
      await fetchVisualizers(selectedPlan.id)
      alert('Visual aids generated! Check below for new images.')
    } catch (error) {
      console.error('Error generating visuals:', error)
      alert('Failed to generate visual aids. Please try again.')
    } finally {
      setGeneratingVisual(false)
    }
  }

  const extractConcepts = (content: string): string[] => {
    // Simple concept extraction - look for key terms
    const concepts = []
    const text = content.toLowerCase()
    
    // Science concepts
    if (text.includes('water cycle')) concepts.push('water cycle')
    if (text.includes('evaporation')) concepts.push('evaporation')
    if (text.includes('condensation')) concepts.push('condensation')
    if (text.includes('precipitation')) concepts.push('precipitation')
    
    // Math concepts
    if (text.includes('fraction')) concepts.push('fractions')
    if (text.includes('multiplication')) concepts.push('multiplication')
    if (text.includes('division')) concepts.push('division')
    
    // Default fallback
    if (concepts.length === 0) {
      concepts.push('lesson concept diagram')
    }
    
    return concepts
  }

  const getBreakInterval = (gradeLevel: string): number => {
    const intervals: { [key: string]: number } = {
      'Pre-K': 8, 'Kindergarten': 10, '1st Grade': 12, '2nd Grade': 12,
      '3rd Grade': 15, '4th Grade': 15, '5th Grade': 18, '6th Grade': 20,
      '7th Grade': 20, '8th Grade': 22, '9th Grade': 25, '10th Grade': 25,
      '11th Grade': 25, '12th Grade': 30,
    }
    return intervals[gradeLevel] || 20
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading lesson plans...</p>
      </div>
    )
  }

  if (lessonPlans.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Plans Yet</h3>
        <p className="text-gray-500 mb-4">
          Upload your first lesson plan to get started with ADHD-friendly adaptations.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Lesson Plans Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Lessons</h2>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => {
                // Refresh lesson plans
                setLoading(true)
                fetchLessonPlans()
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            {lessonPlans.length} lesson{lessonPlans.length !== 1 ? 's' : ''} with ADHD adaptations
          </p>
        </div>
        
        {/* Lessons List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {lessonPlans.map((plan) => (
              <div
                key={plan.id}
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md'
                    : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                }`}
                onClick={() => {
                  setSelectedPlan(plan)
                  setActiveDetailTab('overview')
                }}
              >
                {/* Lesson Card Content */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {plan.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                          {plan.subject}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          {plan.grade_level}
                        </span>
                      </div>
                    </div>
                    
                    {selectedPlan?.id === plan.id && (
                      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {plan.adhd_adapted_content ? (
                        <div className="flex items-center space-x-1 text-xs text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          <span>ADHD Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <Clock className="w-3 h-3" />
                          <span>Processing...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteLessonPlan(plan.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="text-xs text-gray-500">
                    Created {new Date(plan.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Detail View */}
      <div className="flex-1 flex flex-col">
        {selectedPlan ? (
          <>
            {/* Detail Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedPlan.title}</h1>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700">
                      {selectedPlan.subject}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                      {selectedPlan.grade_level}
                    </span>
                    {selectedPlan.adhd_adapted_content && (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-700">
                        <Brain className="w-4 h-4 mr-1" />
                        ADHD Adapted
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={generateVisuals}
                    disabled={generatingVisual}
                    variant="secondary"
                    className="group"
                  >
                    {generatingVisual ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4 mr-2 group-hover:text-purple-600" />
                        Generate Visuals
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={startLiveCoaching}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Coaching
                  </Button>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Layers },
                  { id: 'original', label: 'Original', icon: BookOpen },
                  { id: 'adapted', label: 'ADHD Adapted', icon: Brain },
                  { id: 'visual-aids', label: 'Visual Aids', icon: Palette },
                  { id: 'coaching', label: 'Live Coaching', icon: Clock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeDetailTab === tab.id
                        ? 'bg-white shadow-sm text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeDetailTab === 'overview' && (
                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                        Lesson Overview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium">{selectedPlan.subject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grade Level:</span>
                          <span className="font-medium">{selectedPlan.grade_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{new Date(selectedPlan.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Break Interval:</span>
                          <span className="font-medium">{getBreakInterval(selectedPlan.grade_level)} min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <Button 
                          className="w-full justify-start" 
                          variant="secondary"
                          onClick={() => setActiveDetailTab('original')}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Original Lesson
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="secondary"
                          onClick={() => setActiveDetailTab('adapted')}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          View ADHD Adaptation
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="secondary"
                          onClick={() => setActiveDetailTab('visual-aids')}
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Manage Visual Aids
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Preview */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Content Preview</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700 line-clamp-4">
                        {selectedPlan.original_content.substring(0, 300)}...
                      </p>
                    </div>
                    <Button 
                      className="mt-4" 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setActiveDetailTab('original')}
                    >
                      Read Full Content <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'original' && (
                <div className="p-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
                        Original Lesson Plan
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <div className="whitespace-pre-line">{selectedPlan.original_content}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'adapted' && (
                <div className="p-6">
                  {selectedPlan.adhd_adapted_content ? (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm">
                      <div className="p-6 border-b border-green-200">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <Brain className="w-5 h-5 mr-2 text-green-600" />
                          ADHD-Friendly Adaptations
                        </h3>
                      </div>
                      <div className="p-6">
                        <div 
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: selectedPlan.adhd_adapted_content.replace(/\n/g, '<br>') 
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Adaptations Processing</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        AI is still working on creating ADHD-friendly adaptations for this lesson.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeDetailTab === 'visual-aids' && (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Visual Aids for this Lesson</h3>
                      {loadingVisualizers && (
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                          Loading visuals...
                        </div>
                      )}
                    </div>
                    
                    {visualizers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visualizers.map((visualizer) => (
                          <div key={visualizer.id} className="group">
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                                <img 
                                  src={visualizer.signedUrl || visualizer.image_url} 
                                  alt={visualizer.description}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', visualizer.signedUrl || visualizer.image_url)
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OWFhMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='
                                  }}
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 mb-1 capitalize">{visualizer.concept}</h4>
                                <p className="text-sm text-gray-600">{visualizer.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Image className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Visual Aids Yet</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Generate AI-powered visual aids to help explain complex concepts in this lesson.
                        </p>
                        <Button 
                          onClick={generateVisuals}
                          disabled={generatingVisual}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Generate Visual Aids
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeDetailTab === 'coaching' && (
                <div className="p-6">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-green-600" />
                        Live Coaching Session
                      </h3>
                    </div>
                    <div className="p-6">
                      {showCoaching ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-green-900">Coaching Active</h4>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => setShowCoaching(false)}
                              >
                                Stop Coaching
                              </Button>
                            </div>
                            <BreakReminderSystem 
                              intervalMinutes={getBreakInterval(selectedPlan.grade_level)}
                              reminderText={`Time for a brain break! Perfect for ${selectedPlan.grade_level} attention spans.`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Live Coaching</h4>
                          <p className="text-gray-600 mb-6">
                            Get real-time break reminders optimized for {selectedPlan.grade_level} attention spans.
                          </p>
                          <Button onClick={startLiveCoaching}>
                            <Play className="w-4 h-4 mr-2" />
                            Begin Coaching Session
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Select a Lesson Plan</h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Choose a lesson from the sidebar to view its ADHD adaptations, visual aids, and coaching tools.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}