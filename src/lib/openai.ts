import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateCoachingTips(lessonContent: string, subject: string, gradeLevel: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ADHD education specialist. Analyze lesson plans and provide specific, actionable coaching tips for teachers to better support ADHD students. Focus on attention management, engagement strategies, break timing, and sensory considerations.`
        },
        {
          role: "user",
          content: `Analyze this ${subject} lesson for grade ${gradeLevel} and provide 5-7 specific ADHD-friendly coaching tips:

Lesson Content:
${lessonContent}

Please provide tips in this format:
- **Tip Type**: [engagement/break/visual/movement/attention]
- **Suggestion**: [specific actionable tip]
- **Why**: [brief explanation of ADHD benefit]`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating coaching tips:', error)
    throw new Error('Failed to generate coaching tips')
  }
}

export async function adaptLessonForADHD(lessonContent: string, subject: string, gradeLevel: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ADHD education specialist. Adapt lesson plans to be more ADHD-friendly by breaking content into smaller chunks, adding engagement points, suggesting visual aids, and incorporating movement breaks.`
        },
        {
          role: "user",
          content: `Adapt this ${subject} lesson for grade ${gradeLevel} to be ADHD-friendly:

Original Lesson:
${lessonContent}

Please provide:
1. **Chunked Content**: Break into 10-15 minute segments
2. **Engagement Points**: Interactive elements throughout
3. **Visual Aids Needed**: Specific suggestions for visual supports
4. **Movement Breaks**: Strategic break points and activities
5. **Attention Grabbers**: Hooks to maintain focus`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error adapting lesson for ADHD:', error)
    throw new Error('Failed to adapt lesson for ADHD')
  }
}

export async function generateVisualizer(concept: string, gradeLevel: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create an educational illustration for grade ${gradeLevel} students that visually explains the concept of "${concept}". The image should be:
      - Clear and simple with bright, engaging colors
      - Cartoon or illustration style (not photorealistic)
      - Educational and age-appropriate
      - Designed to help ADHD students understand abstract concepts
      - Include visual metaphors or analogies when helpful`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    })

    return response.data[0]?.url || ''
  } catch (error) {
    console.error('Error generating visualizer:', error)
    throw new Error('Failed to generate visualizer')
  }
}

export default openai