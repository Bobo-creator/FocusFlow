import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    let extractedText = ''

    if (file.type === 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF processing temporarily disabled for deployment compatibility. Please use DOCX or TXT files.' },
        { status: 400 }
      )
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer })
      extractedText = result.value
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Currently supports DOCX and TXT files only.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      text: extractedText,
      length: extractedText.length 
    })

  } catch (error: any) {
    console.error('File processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    )
  }
}