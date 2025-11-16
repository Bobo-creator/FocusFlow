'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, Loader, CheckCircle, AlertCircle, X, Plus, Sparkles, Brain, Clock, Lightbulb } from 'lucide-react'
import * as pdlParser from 'pdf-parse'
import mammoth from 'mammoth'

interface LessonPlanUploadProps {
  userId?: string
}

export default function LessonPlanUpload({ userId }: LessonPlanUploadProps) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadStep, setUploadStep] = useState<'form' | 'processing' | 'success'>('form')
  const [message, setMessage] = useState('')

  const supabase = createClientSupabase()

  const subjects = [
    'Mathematics', 'English Language Arts', 'Science', 'Social Studies',
    'Art', 'Music', 'Physical Education', 'Foreign Language', 'Other'
  ]

  const gradeLevels = [
    'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
    '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setProcessing(true)
    setMessage('Processing file...')

    try {
      let extractedText = ''

      if (selectedFile.type === 'application/pdf') {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const pdfData = await pdlParser(Buffer.from(arrayBuffer))
        extractedText = pdfData.text
      } else if (selectedFile.type.includes('word') || selectedFile.name.endsWith('.docx')) {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        extractedText = result.value
      } else if (selectedFile.type === 'text/plain') {
        extractedText = await selectedFile.text()
      } else {
        throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.')
      }

      setContent(extractedText)
      setMessage('File processed successfully!')
      
      // Auto-extract title if not provided
      if (!title && extractedText) {
        const lines = extractedText.split('\n').filter(line => line.trim())
        if (lines.length > 0) {
          setTitle(lines[0].substring(0, 100)) // First non-empty line as title
        }
      }
    } catch (error: any) {
      setMessage(`Error processing file: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setUploading(true)
    setUploadStep('processing')
    setMessage('Uploading lesson plan...')

    try {
      let fileUrl = null
      
      // Upload file to Supabase Storage if a file was selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lesson-plans')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('lesson-plans')
          .getPublicUrl(fileName)
        
        fileUrl = publicUrl
      }

      // Save lesson plan to database
      const { data, error } = await supabase
        .from('lesson_plans')
        .insert({
          teacher_id: userId,
          title,
          subject,
          grade_level: gradeLevel,
          original_content: content,
          file_url: fileUrl,
        })
        .select()
        .single()

      if (error) throw error

      // Generate ADHD-friendly adaptations
      setMessage('Generating ADHD-friendly adaptations...')
      
      const response = await fetch('/api/adapt-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonPlanId: data.id,
          content,
          subject,
          gradeLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate adaptations')
      }

      setUploadStep('success')
      setMessage('Lesson plan uploaded and adapted successfully!')
      
      // Reset form
      setTimeout(() => {
        setTitle('')
        setSubject('')
        setGradeLevel('')
        setContent('')
        setFile(null)
        setUploadStep('form')
        setMessage('')
      }, 3000)

    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
      setUploadStep('form')
    } finally {
      setUploading(false)
    }
  }

  if (uploadStep === 'processing') {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-spin" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">AI is Working Its Magic</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Processing Steps</span>
              <span className="text-sm text-indigo-600">Step 2 of 3</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-900">Analyzing lesson content</span>
              </div>
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-sm text-gray-900">Generating ADHD adaptations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-300" />
                <span className="text-sm text-gray-500">Creating coaching tips</span>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
            <p className="text-sm text-indigo-700 font-medium mb-1">Did you know?</p>
            <p className="text-sm text-indigo-600">
              Our AI considers 12+ ADHD-specific factors when adapting your lesson plan.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (uploadStep === 'success') {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 animate-bounce">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-yellow-700" />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">🎉 Lesson Adapted Successfully!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-6">
            <h4 className="font-semibold text-green-900 mb-3">What's ready for you:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800">ADHD-friendly lesson structure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800">Real-time coaching tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800">Smart break reminders</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-800">Visual aid suggestions</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Check the <span className="font-semibold text-indigo-600">"My Lessons"</span> tab to view your adaptations!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 mb-4">
          <Brain className="w-4 h-4" />
          <span>AI-Powered ADHD Adaptation</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Your Lesson Plan</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform any lesson into an ADHD-friendly experience with intelligent adaptations, coaching tips, and visual aids.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Options */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Upload className="w-5 h-5 text-indigo-600" />
              <label className="text-lg font-semibold text-gray-900">
                Upload File
              </label>
            </div>
            <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              file 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={processing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">File ready for processing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setContent('')
                      }}
                      className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove file</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        Drop your file here
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        Supports PDF, DOCX, and TXT files
                      </p>
                    </div>
                  </div>
                )}
              </label>
              {processing && (
                <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-6 h-6 text-indigo-600 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-indigo-600 font-medium">Processing file...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-500 bg-white px-3">OR</span>
            </div>
          </div>

          {/* Manual Text Input */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <label className="text-lg font-semibold text-gray-900">
                Paste Content
              </label>
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Paste your lesson plan content here...\n\nExample:\n• Learning objectives\n• Materials needed\n• Lesson activities\n• Assessment methods"
              />
              {content && (
                <button
                  type="button"
                  onClick={() => setContent('')}
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Details */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Lesson Details</h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g., Introduction to Fractions"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="">Choose subject</option>
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gradeLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade Level *
                </label>
                <select
                  id="gradeLevel"
                  required
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="">Choose grade</option>
                  {gradeLevels.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={uploading || processing || !content.trim() || !title.trim() || !subject || !gradeLevel}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                Processing Your Lesson...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-3" />
                Generate ADHD Adaptations
              </>
            )}
          </Button>
          
          {(!content.trim() || !title.trim() || !subject || !gradeLevel) && (
            <p className="text-sm text-gray-500 mt-3">
              Please fill in all required fields to continue
            </p>
          )}
        </div>
        
        {/* What You'll Get Preview */}
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            What you'll get with AI adaptation:
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-3 h-3 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Chunked Learning</p>
                  <p className="text-xs text-indigo-700">10-15 minute focused segments</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-3 h-3 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Visual Aids</p>
                  <p className="text-xs text-indigo-700">AI-generated illustrations</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3 h-3 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Break Reminders</p>
                  <p className="text-xs text-indigo-700">Age-appropriate timing</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Coaching Tips</p>
                  <p className="text-xs text-indigo-700">Real-time suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-xl border ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          <div className="flex items-center">
            {message.includes('Error') || message.includes('error') ? (
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}