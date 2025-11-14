'use client'

import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Plus, MessageSquare, User, Calendar, Filter } from 'lucide-react'

interface TeacherNote {
  id: string
  note_content: string
  note_type: 'behavioral' | 'academic' | 'general'
  created_at: string
  lesson_plans?: {
    title: string
    subject: string
  }
}

interface TeacherNotesProps {
  userId?: string
  lessonPlanId?: string
}

export default function TeacherNotes({ userId, lessonPlanId }: TeacherNotesProps) {
  const [notes, setNotes] = useState<TeacherNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'behavioral' | 'academic' | 'general'>('general')
  const [filter, setFilter] = useState<'all' | 'behavioral' | 'academic' | 'general'>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClientSupabase()

  useEffect(() => {
    if (userId) {
      fetchNotes()
    }
  }, [userId, lessonPlanId])

  const fetchNotes = async () => {
    try {
      let query = supabase
        .from('teacher_notes')
        .select(`
          *,
          lesson_plans:lesson_plan_id (
            title,
            subject
          )
        `)
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })

      if (lessonPlanId) {
        query = query.eq('lesson_plan_id', lessonPlanId)
      }

      const { data, error } = await query

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim() || !userId || !lessonPlanId) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('teacher_notes')
        .insert({
          lesson_plan_id: lessonPlanId,
          teacher_id: userId,
          note_content: newNote.trim(),
          note_type: noteType,
        })
        .select(`
          *,
          lesson_plans:lesson_plan_id (
            title,
            subject
          )
        `)
        .single()

      if (error) throw error

      setNotes([data, ...notes])
      setNewNote('')
      setNoteType('general')
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('teacher_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      setNotes(notes.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(note => note.note_type === filter)

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral':
        return '👥'
      case 'academic':
        return '📚'
      case 'general':
        return '📝'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Teacher Notes</h3>
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Notes</option>
            <option value="behavioral">Behavioral</option>
            <option value="academic">Academic</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Add New Note */}
      {lessonPlanId && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Add New Note</h4>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="general">📝 General</option>
                <option value="behavioral">👥 Behavioral</option>
                <option value="academic">📚 Academic</option>
              </select>
              
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this lesson or student observations..."
                rows={3}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <Button
                onClick={addNote}
                disabled={!newNote.trim() || submitting}
                className="self-start"
              >
                <Plus className="w-4 h-4 mr-1" />
                {submitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Notes Yet</h4>
            <p className="text-gray-500">
              {lessonPlanId 
                ? "Add your first note about this lesson or student observations."
                : "Upload a lesson plan to start adding notes."
              }
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNoteTypeColor(note.note_type)}`}>
                      {getNoteTypeIcon(note.note_type)} {note.note_type}
                    </span>
                    
                    {note.lesson_plans && (
                      <span className="text-sm text-gray-600">
                        {note.lesson_plans.title} • {note.lesson_plans.subject}
                      </span>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <p className="text-gray-800 whitespace-pre-line">{note.note_content}</p>
                </div>
                
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteNote(note.id)}
                  className="ml-4"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {notes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Notes Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-800">
                {notes.filter(n => n.note_type === 'behavioral').length}
              </div>
              <div className="text-blue-600">Behavioral Notes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-800">
                {notes.filter(n => n.note_type === 'academic').length}
              </div>
              <div className="text-blue-600">Academic Notes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-800">
                {notes.filter(n => n.note_type === 'general').length}
              </div>
              <div className="text-blue-600">General Notes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}