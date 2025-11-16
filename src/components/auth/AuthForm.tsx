'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Heart, Loader, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'teacher' | 'parent'>('teacher')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const supabase = createClientSupabase()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            }
          }
        })
        
        if (error) throw error
        
        if (data.user) {
          // Insert profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              role: role,
            })
          
          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw here - user is created, just profile failed
            setMessage('Account created! Please check your email to confirm, then sign in.')
          } else {
            setMessage('Account created! Please check your email to confirm, then sign in.')
          }
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('Login error:', error)
          if (error.message.includes('Invalid login credentials')) {
            setMessage('Invalid email or password. Make sure you\'ve confirmed your email address.')
          } else if (error.message.includes('Email not confirmed')) {
            setMessage('Please check your email and click the confirmation link before signing in.')
          } else {
            setMessage(error.message)
          }
          return
        }
        
        if (data.user) {
          setMessage('Signed in successfully!')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setMessage(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Toggle */}
      <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl p-1 mb-6">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              !isSignUp 
                ? 'bg-white shadow-md text-indigo-600 border border-indigo-200' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              isSignUp 
                ? 'bg-white shadow-md text-indigo-600 border border-indigo-200' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Auth Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Join FocusFlow' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Start creating ADHD-friendly lessons today' 
              : 'Continue your teaching journey'
            }
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                      role === 'teacher'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 mb-2" />
                    <span className="font-medium text-sm">Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                      role === 'parent'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Heart className="w-6 h-6 mb-2" />
                    <span className="font-medium text-sm">Parent</span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-3 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </Button>
        </form>
        
        {message && (
          <div className={`mt-6 p-4 rounded-xl border ${
            message.includes('error') || message.includes('Error') 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            <div className="flex items-center">
              {message.includes('error') || message.includes('Error') ? (
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}
        
        {!isSignUp && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}