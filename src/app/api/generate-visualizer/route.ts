import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateVisualizer } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { lessonPlanId, concept, gradeLevel, description } = await request.json()

    console.log('Generate visualizer request:', { lessonPlanId, concept, gradeLevel, description })

    if (!lessonPlanId || !concept || !gradeLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin

    console.log('Generating visualizer with OpenAI...')
    // Generate visualizer image
    const openAiImageUrl = await generateVisualizer(concept, gradeLevel)
    console.log('OpenAI image URL generated:', openAiImageUrl)

    if (!openAiImageUrl) {
      throw new Error('Failed to generate visualizer image')
    }

    // Download the image from OpenAI and upload to Supabase Storage
    let permanentImageUrl = openAiImageUrl
    
    try {
      console.log('Fetching image from OpenAI...')
      // Fetch the image from OpenAI
      const imageResponse = await fetch(openAiImageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch generated image')
      }
      
      console.log('Converting image to buffer...')
      const imageBuffer = await imageResponse.arrayBuffer()
      const imageFile = new Uint8Array(imageBuffer)
      
      // Generate a unique filename
      const fileName = `${concept.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.png`
      const filePath = `${lessonPlanId}/${fileName}`
      
      console.log('Uploading to Supabase Storage:', filePath)
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('visualizers')
        .upload(filePath, imageFile, {
          contentType: 'image/png',
          upsert: false
        })
      
      if (uploadError) {
        console.warn('Failed to upload to storage:', uploadError)
        // Continue with OpenAI URL as fallback
      } else {
        console.log('Upload successful, getting public URL...')
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('visualizers')
          .getPublicUrl(filePath)
        
        permanentImageUrl = publicUrl
        console.log('Permanent URL created:', permanentImageUrl)
      }
    } catch (storageError) {
      console.warn('Storage operation failed, using original OpenAI URL:', storageError)
      // Continue with OpenAI URL as fallback
    }

    console.log('Saving visualizer to database...')
    // Save visualizer to database
    const { data, error } = await (supabase
      .from('visualizers') as any)
      .insert({
        lesson_plan_id: lessonPlanId,
        concept,
        image_url: permanentImageUrl,
        grade_level: gradeLevel,
        description: description || `Visual representation of ${concept} for ${gradeLevel} students`,
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }
    
    console.log('Visualizer saved successfully:', data)

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