'use client'

import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'gradient' | 'glass'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Card({ 
  children, 
  className, 
  variant = 'default', 
  padding = 'md',
  ...props 
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        {
          'bg-white border-gray-200 shadow-sm hover:shadow-md': variant === 'default',
          'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg hover:shadow-xl': variant === 'gradient',
          'bg-white/80 backdrop-blur-sm border-indigo-100 shadow-xl': variant === 'glass',
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'p-12': padding === 'xl',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}