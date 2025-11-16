'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import BreakReminderSystem from '@/components/BreakReminderSystem'
import { BookOpen, Clock, Brain, Play, ArrowLeft } from 'lucide-react'

interface LessonPlan {
  id: string
  title: string
  subject: string
  grade_level: string
  original_content: string
  adhd_adapted_content: string | null
  created_at: string
}

interface CoachingTip {
  id: string
  tip_text: string
  tip_type: 'engagement' | 'break' | 'visual' | 'movement' | 'attention'
}

interface LiveCoachingProps {
  userId?: string
}

export default function LiveCoaching({ userId }: LiveCoachingProps) {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null)
  const [coachingTips, setCoachingTips] = useState<CoachingTip[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCoaching, setActiveCoaching] = useState(false)
  const supabase = createClientSupabase()

  useEffect(() => {
    if (userId) {
      fetchLessonPlans()
    }
  }, [userId])

  useEffect(() => {
    if (selectedPlan) {
      fetchCoachingTips(selectedPlan.id)
    }
  }, [selectedPlan])

  const fetchLessonPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', userId)
        .not('adhd_adapted_content', 'is', null) // Only show plans with adaptations
        .order('created_at', { ascending: false })

      if (error) throw error
      setLessonPlans(data || [])
    } catch (error) {
      console.error('Error fetching lesson plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCoachingTips = async (lessonPlanId: string) => {
    try {
      const { data, error } = await supabase
        .from('coaching_tips')
        .select('*')
        .eq('lesson_plan_id', lessonPlanId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoachingTips(data || [])
    } catch (error) {
      console.error('Error fetching coaching tips:', error)
    }
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

  const getTipIcon = (tipType: string) => {
    switch (tipType) {
      case 'engagement': return '🎯'
      case 'break': return '⏰'
      case 'visual': return '👁️'
      case 'movement': return '🏃'
      case 'attention': return '🔍'
      default: return '💡'
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
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Plans Ready</h3>
        <p className="text-gray-500 mb-4">
          Upload and process a lesson plan first to access live coaching features.
        </p>
        <Button onClick={() => window.location.reload()}>
          <BookOpen className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Select a Lesson for Live Coaching</h3>
        <div className="grid gap-4">
          {lessonPlans.map((plan) => (
            <div
              key={plan.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {plan.subject}
                    </span>
                    <span>{plan.grade_level}</span>
                    <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Coaching
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activeCoaching) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.title}</h3>
            <p className="text-sm text-gray-600">{selectedPlan.subject} • {selectedPlan.grade_level}</p>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setActiveCoaching(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setup
          </Button>
        </div>

        {/* Break Timer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <BreakReminderSystem 
            intervalMinutes={getBreakInterval(selectedPlan.grade_level)}
            reminderText={`Time for a brain break! Perfect for ${selectedPlan.grade_level} attention spans.`}
          />
        </div>

        {/* Coaching Tips */}
        {coachingTips.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-green-600" />
              AI Coaching Tips for This Lesson
            </h4>
            <div className="grid gap-3">
              {coachingTips.map((tip) => (
                <div key={tip.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-lg">{getTipIcon(tip.tip_type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{tip.tip_text}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-1 capitalize">
                      {tip.tip_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selected Lesson Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.title}</h3>
          <p className="text-sm text-gray-600">{selectedPlan.subject} • {selectedPlan.grade_level}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setSelectedPlan(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Choose Different Lesson
        </Button>
      </div>

      {/* Coaching Setup */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Ready to Start Live Coaching?</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Break timer: {getBreakInterval(selectedPlan.grade_level)} minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span>AI tips: {coachingTips.length} suggestions ready</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h5 className="font-medium text-yellow-800 mb-2">Before You Begin:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Make sure your device volume is on for break notifications</li>
              <li>• Review the AI coaching tips below</li>
              <li>• Have your lesson materials ready</li>
              <li>• Position your device where you can see the timer</li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => setActiveCoaching(true)}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Live Coaching Session
          </Button>
        </div>
      </div>

      {/* Preview Coaching Tips */}
      {coachingTips.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Preview: AI Coaching Tips</h4>
          <div className="grid gap-2">
            {coachingTips.slice(0, 3).map((tip) => (
              <div key={tip.id} className="flex items-start space-x-2 text-sm">
                <span>{getTipIcon(tip.tip_type)}</span>
                <span className="text-gray-700">{tip.tip_text}</span>
              </div>
            ))}
            {coachingTips.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                +{coachingTips.length - 3} more tips available during coaching...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}