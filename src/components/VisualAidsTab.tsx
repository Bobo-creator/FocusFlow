'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Search, Plus, Image, Palette, Eye, Trash2, Download, RefreshCw, Calendar, BookOpen } from 'lucide-react'

interface Visualizer {
  id: string
  concept: string
  image_url: string
  description: string
  grade_level?: string
  created_at: string
  lesson_plans: {
    id: string
    title: string
    subject: string
    grade_level: string
  } | null
}

interface VisualAidsTabProps {
  userId?: string
}

export default function VisualAidsTab({ userId }: VisualAidsTabProps) {
  const [visualizers, setVisualizers] = useState<Visualizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const supabase = createClientSupabase()

  useEffect(() => {
    if (userId) {
      fetchVisualizers()
      fetchSubjects()
    }
  }, [userId])

  const fetchVisualizers = async () => {
    try {
      setLoading(true)
      
      // Get all visualizers for the user's lessons
      const { data, error } = await supabase
        .from('visualizers')
        .select(`
          *,
          lesson_plans!inner(
            id,
            title,
            subject,
            grade_level,
            teacher_id
          )
        `)
        .eq('lesson_plans.teacher_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setVisualizers(data || [])
    } catch (error: any) {
      console.error('Error fetching visualizers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      // Get unique subjects from user's lesson plans
      const { data, error } = await supabase
        .from('lesson_plans')
        .select('subject')
        .eq('teacher_id', userId)

      if (error) throw error

      const uniqueSubjects = [...new Set(data?.map(plan => plan.subject) || [])]
      setSubjects(uniqueSubjects)
    } catch (error: any) {
      console.error('Error fetching subjects:', error)
    }
  }

  const deleteVisualizer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visualizers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVisualizers(prev => prev.filter(v => v.id !== id))
    } catch (error: any) {
      console.error('Error deleting visualizer:', error)
    }
  }

  const filteredVisualizers = visualizers.filter(visualizer => {
    const matchesSearch = !searchTerm || 
      visualizer.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visualizer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visualizer.lesson_plans?.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = !subjectFilter || 
      visualizer.lesson_plans?.subject === subjectFilter

    return matchesSearch && matchesSubject
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your visual aids...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Aids Gallery</h2>
          <p className="text-gray-600">
            {visualizers.length} AI-generated visual aid{visualizers.length !== 1 ? 's' : ''} across your lessons
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary"
            onClick={() => {
              setLoading(true)
              fetchVisualizers()
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => {
              // TODO: Open visual aid generator modal
              alert('Visual aid generator coming soon!')
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Visual Aid
          </Button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search visual aids by concept, lesson, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[160px]"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        
        {searchTerm || subjectFilter ? (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {filteredVisualizers.length} of {visualizers.length} visual aids
            </span>
            {(searchTerm || subjectFilter) && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSubjectFilter('')
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Visual Aids Grid */}
      {filteredVisualizers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVisualizers.map((visualizer) => (
            <div key={visualizer.id} className="group">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                {/* Image */}
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                  <img 
                    src={visualizer.image_url} 
                    alt={visualizer.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', visualizer.image_url)
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OWFhMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg=='
                    }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        onClick={() => window.open(visualizer.image_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = visualizer.image_url
                          link.download = `${visualizer.concept}-visual-aid.jpg`
                          link.click()
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this visual aid?')) {
                            deleteVisualizer(visualizer.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize truncate">
                      {visualizer.concept}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {visualizer.description}
                    </p>
                  </div>
                  
                  {/* Lesson Info */}
                  {visualizer.lesson_plans && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">
                          {visualizer.lesson_plans.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                          {visualizer.lesson_plans.subject}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {visualizer.grade_level || visualizer.lesson_plans?.grade_level}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Created Date */}
                  <div className="flex items-center space-x-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Created {new Date(visualizer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {visualizers.length === 0 ? 'No Visual Aids Yet' : 'No matches found'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {visualizers.length === 0 
              ? 'Create your first AI-generated visual aid to help explain complex concepts to your ADHD students.'
              : 'Try adjusting your search terms or filters to find what you\'re looking for.'
            }
          </p>
          {visualizers.length === 0 && (
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => {
                // TODO: Open visual aid generator
                alert('Visual aid generator coming soon!')
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Visual Aid
            </Button>
          )}
        </div>
      )}
    </div>
  )
}