# 🎯 FocusFlow - ADHD-Friendly Teaching Companion

An AI-powered teaching companion that helps teachers adapt their lessons, communication, and routines to better support ADHD learners.

## 🌟 Features

### 📚 **Lesson Plan Upload & Analysis**
- Upload PDF, DOCX, or TXT files
- Automatic text extraction and processing
- Manual text input option
- Support for all subjects and grade levels

### 🧠 **AI-Powered ADHD Adaptations**
- GPT-4 analysis of lesson content
- Chunked content for improved focus
- Interactive engagement strategies
- Visual aid recommendations
- Movement break suggestions

### 💡 **Real-Time Coaching Tips**
- Context-aware teaching suggestions
- Multiple tip categories:
  - 🎯 Engagement strategies
  - ⏰ Break timing
  - 👁️ Visual supports
  - 🏃 Movement activities
  - 🔍 Attention management

### 🎨 **Visual Aid Generator**
- DALL-E 3 powered image generation
- Concept-specific illustrations
- Age-appropriate visual content
- Educational metaphors and analogies

### ⏰ **Smart Break Reminder System**
- Age-based break intervals
- Audio and browser notifications
- Guided break activities
- Focus timer with progress tracking

### 📝 **Teacher Notes & Progress Tracking**
- Behavioral observations
- Academic progress notes
- General lesson feedback
- Filterable note categories

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Set up Supabase database** (see [SETUP.md](./SETUP.md) for detailed instructions)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Visit [http://localhost:3000](http://localhost:3000)**

## 📋 Complete Setup Guide

For detailed setup instructions including Supabase configuration and database schema, see [SETUP.md](./SETUP.md).

## 🎨 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 & DALL-E 3
- **File Processing**: pdf-parse, mammoth
- **Deployment**: Vercel

## 👥 User Roles

### 👩‍🏫 **Teachers**
- Upload and manage lesson plans
- Get AI-powered ADHD adaptations
- Access real-time coaching tips
- Generate visual aids for concepts
- Track student progress with notes
- Use break reminder system during lessons

### 👨‍👩‍👧‍👦 **Parents** (Future Enhancement)
- View lesson summaries
- Read teacher notes and feedback
- Track student progress
- Access ADHD resources

## 🎯 MVP Status

✅ **Core Features Complete:**
- User authentication & roles
- Lesson plan upload & processing
- AI-powered ADHD adaptations
- Real-time coaching tips
- Visual aid generation (DALL-E 3)
- Smart break reminder system
- Teacher notes & progress tracking

## 🔮 Future Enhancements

- Parent-teacher communication portal
- Google Classroom integration
- Mobile app (React Native)
- ADHD Learning Hub with resources
- Advanced analytics dashboard
- Calendar integration
- Student progress visualization

**Built with ❤️ for teachers and students with ADHD**
