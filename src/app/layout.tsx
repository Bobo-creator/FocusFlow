import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FocusFlow - ADHD-Friendly Teaching Companion',
  description: 'AI-powered teaching companion that helps teachers adapt lessons for ADHD students',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}