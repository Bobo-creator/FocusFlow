import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FocusFlow - ADHD-Friendly Teaching Companion',
  description: 'AI-powered teaching companion that helps teachers adapt lessons for ADHD students with intelligent adaptations, coaching tips, and visual aids',
  keywords: 'ADHD, education, teaching, AI, lesson plans, accessibility, special education',
  authors: [{ name: 'FocusFlow Team' }],
  creator: 'FocusFlow',
  metadataBase: new URL('https://focusflow.ai'),
  openGraph: {
    title: 'FocusFlow - ADHD-Friendly Teaching Companion',
    description: 'Transform any lesson into an ADHD-friendly experience with AI-powered adaptations',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusFlow - ADHD-Friendly Teaching Companion',
    description: 'AI-powered teaching tools for ADHD-inclusive education',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 antialiased">
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  )
}