# 🏗️ FocusFlow Project Structure

## 📁 Corrected Directory Structure

```
FocusFlow/                           # Main project directory
├── .env.local                      # Environment variables
├── .git/                           # Git repository
├── .gitignore                      # Git ignore rules
├── .next/                          # Next.js build output
├── README.md                       # Project documentation
├── SETUP.md                        # Detailed setup guide
├── PROJECT_STRUCTURE.md            # This file
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Lock file
├── next.config.ts                  # Next.js configuration
├── next-env.d.ts                   # Next.js TypeScript types
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.mjs              # PostCSS configuration
├── eslint.config.mjs               # ESLint configuration
├── public/                         # Static assets
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── node_modules/                   # Dependencies (auto-generated)
└── src/                           # Source code
    ├── app/                       # Next.js App Router
    │   ├── layout.tsx            # Root layout component
    │   ├── page.tsx              # Home page component
    │   ├── globals.css           # Global styles
    │   ├── favicon.ico           # App favicon
    │   └── api/                  # API routes
    │       ├── adapt-lesson/
    │       │   └── route.ts      # Lesson adaptation API
    │       └── generate-visualizer/
    │           └── route.ts      # Visual generator API
    ├── components/               # React components
    │   ├── auth/
    │   │   └── AuthForm.tsx     # Authentication form
    │   ├── ui/
    │   │   └── Button.tsx       # Reusable button component
    │   ├── Dashboard.tsx         # Main dashboard
    │   ├── LessonPlanUpload.tsx # File upload component
    │   ├── LessonPlanList.tsx   # Lesson plans display
    │   ├── BreakReminderSystem.tsx # Timer component
    │   └── TeacherNotes.tsx     # Notes interface
    └── lib/                     # Utility libraries
        ├── supabase.ts          # Supabase client setup
        ├── supabase-server.ts   # Supabase server utilities
        ├── openai.ts            # OpenAI integration
        └── utils.ts             # General utilities
```

## 🎯 Key Components Overview

### 🔧 **Core Infrastructure**
- **Authentication**: Role-based auth with Supabase
- **Database**: PostgreSQL with Row Level Security
- **File Storage**: Supabase Storage for lesson plan files
- **AI Integration**: OpenAI GPT-4 + DALL-E 3

### 📱 **User Interface**
- **Dashboard.tsx**: Main application interface
- **AuthForm.tsx**: User registration and login
- **LessonPlanUpload.tsx**: File upload and processing
- **LessonPlanList.tsx**: Lesson plan management
- **BreakReminderSystem.tsx**: Focus timer with notifications
- **TeacherNotes.tsx**: Progress tracking interface

### 🔌 **API Endpoints**
- **`/api/adapt-lesson`**: Generates ADHD adaptations
- **`/api/generate-visualizer`**: Creates visual aids

### 🗄️ **Database Schema**
- **profiles**: User accounts (teachers/parents)
- **lesson_plans**: Lesson content and adaptations
- **coaching_tips**: AI-generated suggestions
- **visualizers**: Generated images for concepts
- **break_reminders**: Timer configurations
- **teacher_notes**: Progress tracking notes

## 🚀 **Development Commands**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📄 **Configuration Files**

- **`.env.local`**: Environment variables (Supabase + OpenAI keys)
- **`next.config.ts`**: Next.js configuration
- **`tailwind.config.ts`**: Tailwind CSS setup
- **`tsconfig.json`**: TypeScript compiler options
- **`package.json`**: Project dependencies and scripts

## 🎨 **Styling System**

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable UI components in `/components/ui/`
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Blue primary with semantic colors for different note types

## 🔒 **Security Features**

- **Row Level Security**: Database-level access control
- **Environment Variables**: Secure API key management
- **Role-based Access**: Teacher/Parent permission system
- **Input Validation**: Form validation and sanitization

This structure provides a clean, maintainable codebase that's ready for production deployment and future enhancements.