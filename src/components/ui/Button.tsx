'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Button({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow-md': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-200': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm hover:shadow-md': variant === 'danger',
          'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]': variant === 'gradient',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
          'h-14 px-8 text-xl': size === 'xl',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}