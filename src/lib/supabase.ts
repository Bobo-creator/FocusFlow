import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createClientSupabase = () => createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'teacher' | 'parent' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'teacher' | 'parent' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'teacher' | 'parent' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      lesson_plans: {
        Row: {
          id: string
          teacher_id: string
          title: string
          subject: string
          grade_level: string
          original_content: string
          adhd_adapted_content: string | null
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          title: string
          subject: string
          grade_level: string
          original_content: string
          adhd_adapted_content?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          title?: string
          subject?: string
          grade_level?: string
          original_content?: string
          adhd_adapted_content?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coaching_tips: {
        Row: {
          id: string
          lesson_plan_id: string
          tip_text: string
          tip_type: 'engagement' | 'break' | 'visual' | 'movement' | 'attention'
          timestamp: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_plan_id: string
          tip_text: string
          tip_type: 'engagement' | 'break' | 'visual' | 'movement' | 'attention'
          timestamp?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_plan_id?: string
          tip_text?: string
          tip_type?: 'engagement' | 'break' | 'visual' | 'movement' | 'attention'
          timestamp?: string | null
          created_at?: string
        }
      }
      visualizers: {
        Row: {
          id: string
          lesson_plan_id: string
          concept: string
          image_url: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          lesson_plan_id: string
          concept: string
          image_url: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          lesson_plan_id?: string
          concept?: string
          image_url?: string
          description?: string
          created_at?: string
        }
      }
      break_reminders: {
        Row: {
          id: string
          lesson_plan_id: string
          interval_minutes: number
          reminder_text: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lesson_plan_id: string
          interval_minutes: number
          reminder_text: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lesson_plan_id?: string
          interval_minutes?: number
          reminder_text?: string
          is_active?: boolean
          created_at?: string
        }
      }
      teacher_notes: {
        Row: {
          id: string
          lesson_plan_id: string
          teacher_id: string
          note_content: string
          note_type: 'behavioral' | 'academic' | 'general'
          created_at: string
        }
        Insert: {
          id?: string
          lesson_plan_id: string
          teacher_id: string
          note_content: string
          note_type: 'behavioral' | 'academic' | 'general'
          created_at?: string
        }
        Update: {
          id?: string
          lesson_plan_id?: string
          teacher_id?: string
          note_content?: string
          note_type?: 'behavioral' | 'academic' | 'general'
          created_at?: string
        }
      }
    }
  }
}