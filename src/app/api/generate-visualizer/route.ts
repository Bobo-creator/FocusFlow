import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateVisualizer } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { lessonPlanId, concept, gradeLevel, description } = await request.json()

    if (!lessonPlanId || !concept || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    // Generate visualizer image
    const imageUrl = await generateVisualizer(concept, gradeLevel)

    if (!imageUrl) {
      throw new Error('Failed to generate visualizer image')
    }

    // Save visualizer to database
    const { data, error } = await supabase
      .from('visualizers')
      .insert({
        lesson_plan_id: lessonPlanId,
        concept,
        image_url: imageUrl,
        description: description || `Visual representation of ${concept} for ${gradeLevel} students`,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      visualizer: data 
    })

  } catch (error: any) {
    console.error('Error generating visualizer:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate visualizer' },
      { status: 500 }
    )
  }
}