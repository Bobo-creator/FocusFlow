# FocusFlow Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and API keys from Settings > API
3. Run the following SQL to create the database schema:

```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'parent', 'admin')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_plans table
CREATE TABLE lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  original_content TEXT NOT NULL,
  adhd_adapted_content TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaching_tips table
CREATE TABLE coaching_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE NOT NULL,
  tip_text TEXT NOT NULL,
  tip_type TEXT CHECK (tip_type IN ('engagement', 'break', 'visual', 'movement', 'attention')) NOT NULL,
  timestamp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visualizers table
CREATE TABLE visualizers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE NOT NULL,
  concept TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create break_reminders table
CREATE TABLE break_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE NOT NULL,
  interval_minutes INTEGER NOT NULL,
  reminder_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_notes table
CREATE TABLE teacher_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  note_content TEXT NOT NULL,
  note_type TEXT CHECK (note_type IN ('behavioral', 'academic', 'general')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE break_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for lesson_plans
CREATE POLICY "Teachers can view own lessons" ON lesson_plans
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own lessons" ON lesson_plans
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own lessons" ON lesson_plans
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own lessons" ON lesson_plans
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create policies for coaching_tips
CREATE POLICY "Users can view tips for their lessons" ON coaching_tips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lesson_plans 
      WHERE id = coaching_tips.lesson_plan_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "System can insert coaching tips" ON coaching_tips
  FOR INSERT WITH CHECK (true);

-- Create policies for visualizers
CREATE POLICY "Users can view visualizers for their lessons" ON visualizers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lesson_plans 
      WHERE id = visualizers.lesson_plan_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "System can insert visualizers" ON visualizers
  FOR INSERT WITH CHECK (true);

-- Create policies for break_reminders
CREATE POLICY "Users can view break reminders for their lessons" ON break_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lesson_plans 
      WHERE id = break_reminders.lesson_plan_id 
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "System can insert break reminders" ON break_reminders
  FOR INSERT WITH CHECK (true);

-- Create policies for teacher_notes
CREATE POLICY "Teachers can view own notes" ON teacher_notes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own notes" ON teacher_notes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own notes" ON teacher_notes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create storage bucket for lesson plans
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-plans', 'lesson-plans', true);

-- Create storage policies
CREATE POLICY "Users can upload lesson plan files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lesson-plans' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view lesson plan files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lesson-plans'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. OpenAI Setup

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. Make sure you have credits in your OpenAI account

### 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to see your app!

## 🎯 MVP Features Included

✅ **User Authentication**
- Teacher/Parent role-based signup
- Secure login with Supabase Auth

✅ **Lesson Plan Upload**
- Support for PDF, DOCX, and TXT files
- Automatic text extraction
- Manual text input option

✅ **AI-Powered ADHD Adaptations**
- GPT-4 analysis of lesson content
- Chunked content for better focus
- Engagement strategies
- Visual aid suggestions

✅ **Real-Time Coaching Tips**
- Context-aware suggestions
- Multiple tip categories (engagement, break, visual, movement, attention)
- Grade-level appropriate recommendations

✅ **Visualizer Generator**
- DALL-E 3 integration
- Concept-specific illustrations
- Age-appropriate visual aids

✅ **Smart Break Reminders**
- Age-based break intervals
- Audio and browser notifications
- Break activity suggestions
- Focus timer with progress tracking

✅ **Teacher Notes System**
- Behavioral, academic, and general notes
- Lesson-specific annotations
- Notes filtering and search
- Progress tracking

## 🔧 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 & DALL-E 3
- **File Processing**: pdf-parse, mammoth
- **Deployment**: Vercel (recommended)

## 📱 Usage Guide

### For Teachers:
1. **Sign Up** as a Teacher
2. **Upload Lesson Plans** via file or text
3. **Review AI Adaptations** generated for ADHD students
4. **Use Break Timer** during lessons
5. **Add Notes** about student progress
6. **Generate Visual Aids** for concepts

### For Parents:
1. **Sign Up** as a Parent
2. **View Student Progress** (when connected by teacher)
3. **Read Teacher Notes** and feedback
4. **Access Lesson Summaries**

## 🚀 Deployment

### Deploy to Vercel:

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔮 Next Steps for Full MVP

Current implementation includes all core MVP features. Future enhancements could include:

- **Parent-Teacher Communication**: Direct messaging system
- **Student Progress Dashboard**: Visual progress tracking
- **Calendar Integration**: Google Classroom sync
- **Mobile App**: React Native version
- **ADHD Learning Hub**: Educational resources
- **Analytics Dashboard**: Usage and effectiveness metrics

## 🐛 Troubleshooting

### Common Issues:

1. **Supabase Connection**: Check your URL and API keys
2. **OpenAI Errors**: Verify API key and account credits
3. **File Upload Issues**: Check Supabase storage bucket setup
4. **Build Errors**: Clear `.next` folder and reinstall node_modules

### Support:

For issues, check the console logs and verify:
- Environment variables are correct
- Supabase schema is properly created
- OpenAI API key has sufficient credits
- All dependencies are installed