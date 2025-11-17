import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { adaptLessonForADHD, generateCoachingTips } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { lessonPlanId, content, subject, gradeLevel } = await request.json()

    if (!lessonPlanId || !content || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    // Generate ADHD adaptations
    const adaptedContent = await adaptLessonForADHD(content, subject, gradeLevel)
    
    // Generate coaching tips
    const coachingTips = await generateCoachingTips(content, subject, gradeLevel)

    // Update lesson plan with adapted content
    const { error: updateError } = await (supabase
      .from('lesson_plans') as any)
      .update({
        adhd_adapted_content: adaptedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonPlanId)

    if (updateError) throw updateError

    // Parse and save coaching tips
    if (coachingTips) {
      const tips = parseCoachingTips(coachingTips)
      
      for (const tip of tips) {
        await (supabase.from('coaching_tips') as any).insert({
          lesson_plan_id: lessonPlanId,
          tip_text: tip.suggestion,
          tip_type: tip.type,
        })
      }
    }

    // Generate break reminders based on grade level
    const breakInterval = getBreakInterval(gradeLevel)
    await (supabase.from('break_reminders') as any).insert({
      lesson_plan_id: lessonPlanId,
      interval_minutes: breakInterval,
      reminder_text: `Time for a brain break! Try a 2-minute movement activity.`,
      is_active: true,
    })

    return NextResponse.json({ 
      success: true, 
      adaptedContent,
      coachingTips: coachingTips 
    })

  } catch (error: any) {
    console.error('Error adapting lesson:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to adapt lesson' },
      { status: 500 }
    )
  }
}

function parseCoachingTips(tipsText: string) {
  const tips = []
  const lines = tipsText.split('\n').filter(line => line.trim())
  
  let currentTip: { type: 'engagement' | 'break' | 'visual' | 'movement' | 'attention', suggestion: string } = { type: 'engagement', suggestion: '' }
  
  for (const line of lines) {
    if (line.includes('**Tip Type**:')) {
      if (currentTip.suggestion) {
        tips.push({ ...currentTip })
      }
      const type = line.toLowerCase()
      if (type.includes('break')) currentTip.type = 'break'
      else if (type.includes('visual')) currentTip.type = 'visual'
      else if (type.includes('movement')) currentTip.type = 'movement'
      else if (type.includes('attention')) currentTip.type = 'attention'
      else currentTip.type = 'engagement'
      currentTip.suggestion = ''
    } else if (line.includes('**Suggestion**:')) {
      currentTip.suggestion = line.replace(/\*\*Suggestion\*\*:\s*/, '')
    } else if (currentTip.suggestion && !line.includes('**Why**:')) {
      currentTip.suggestion += ' ' + line
    }
  }
  
  if (currentTip.suggestion) {
    tips.push(currentTip)
  }
  
  return tips.slice(0, 7) // Limit to 7 tips
}

function getBreakInterval(gradeLevel: string): number {
  // Break intervals based on age/grade (in minutes)
  const intervals: { [key: string]: number } = {
    'Pre-K': 8,
    'Kindergarten': 10,
    '1st Grade': 12,
    '2nd Grade': 12,
    '3rd Grade': 15,
    '4th Grade': 15,
    '5th Grade': 18,
    '6th Grade': 20,
    '7th Grade': 20,
    '8th Grade': 22,
    '9th Grade': 25,
    '10th Grade': 25,
    '11th Grade': 25,
    '12th Grade': 30,
  }
  
  return intervals[gradeLevel] || 20
}