'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import BreakReminderSystem from '@/components/BreakReminderSystem'
import { BookOpen, Brain, Clock, Eye, Trash2, Image } from 'lucide-react'

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
}

interface LessonPlanListProps {
  userId?: string
}

export default function LessonPlanList({ userId }: LessonPlanListProps) {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)
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
      setVisualizers(data || [])
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lesson Plans List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Lesson Plans</h3>
        <div className="space-y-3">
          {lessonPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{plan.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{plan.subject}</span>
                    <span>•</span>
                    <span>{plan.grade_level}</span>
                    <span>•</span>
                    <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {plan.adhd_adapted_content && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Brain className="w-3 h-3 mr-1" />
                        ADHD Adapted
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlan(plan)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLessonPlan(plan.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Plan Details */}
      <div>
        {selectedPlan ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedPlan.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedPlan.subject}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {selectedPlan.grade_level}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Original Lesson Plan
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedPlan.original_content.length > 500
                      ? `${selectedPlan.original_content.substring(0, 500)}...`
                      : selectedPlan.original_content
                    }
                  </p>
                </div>
              </div>

              {selectedPlan.adhd_adapted_content && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-green-600" />
                    ADHD-Friendly Adaptations
                  </h4>
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div 
                      className="text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedPlan.adhd_adapted_content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Generated Visual Aids */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Image className="w-4 h-4 mr-2 text-purple-600" />
                  Visual Aids
                  {loadingVisualizers && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 ml-2"></div>
                  )}
                </h4>
                {visualizers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visualizers.map((visualizer) => (
                      <div key={visualizer.id} className="bg-purple-50 p-4 rounded-md border border-purple-200">
                        <img 
                          src={visualizer.image_url} 
                          alt={visualizer.description}
                          className="w-full h-48 object-cover rounded-md mb-2"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OWFhMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='
                          }}
                        />
                        <h5 className="font-medium text-purple-900 mb-1 capitalize">{visualizer.concept}</h5>
                        <p className="text-sm text-purple-700">{visualizer.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No visual aids generated yet.</p>
                    <p className="text-xs text-gray-500">Click "Generate Visuals" to create AI-powered images for this lesson.</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={startLiveCoaching}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Start Live Coaching
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={generateVisuals}
                  disabled={generatingVisual}
                >
                  {generatingVisual ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Generate Visuals
                    </>
                  )}
                </Button>
              </div>
              
              {showCoaching && selectedPlan && (
                <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-blue-900">Live Coaching Mode</h4>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowCoaching(false)}
                    >
                      Exit Coaching
                    </Button>
                  </div>
                  <BreakReminderSystem 
                    intervalMinutes={getBreakInterval(selectedPlan.grade_level)}
                    reminderText={`Time for a brain break! Perfect for ${selectedPlan.grade_level} attention spans.`}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Lesson Plan</h4>
            <p className="text-gray-500">
              Click on a lesson plan from the list to view its details and ADHD adaptations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}