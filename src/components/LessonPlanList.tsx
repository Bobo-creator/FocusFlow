'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { BookOpen, Brain, Clock, Eye, Trash2 } from 'lucide-react'

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade_level: string
  original_content: string
  adhd_adapted_content: string | null
  created_at: string
}

interface LessonPlanListProps {
  userId?: string
}

export default function LessonPlanList({ userId }: LessonPlanListProps) {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)
  const supabase = createClientSupabase()

  useEffect(() => {
    if (userId) {
      fetchLessonPlans()
    }
  }, [userId])

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

              <div className="flex space-x-3">
                <Button size="sm" className="flex-1">
                  <Clock className="w-4 h-4 mr-2" />
                  Start Live Coaching
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Visuals
                </Button>
              </div>
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