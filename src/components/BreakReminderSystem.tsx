'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Clock, Play, Pause, RotateCcw, Bell } from 'lucide-react'

interface BreakReminderSystemProps {
  intervalMinutes: number
  reminderText?: string
  onBreakTime?: () => void
}

export default function BreakReminderSystem({ 
  intervalMinutes, 
  reminderText = "Time for a brain break!",
  onBreakTime 
}: BreakReminderSystemProps) {
  const [timeLeft, setTimeLeft] = useState(intervalMinutes * 60) // Convert to seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreakTime, setIsBreakTime] = useState(false)
  const [breakDuration, setBreakDuration] = useState(120) // 2 minutes default break
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio context for break notifications
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeFEGa2e+RQSgFV3+ysXw8Cjuy1PGfUSsXKMLO6rJaEhVIj93yxH8kCFCIzPfUdSUFQHzG6ODPcjsFdKXp+6BSFw9L8u+jUSgXOojL6aRTFA9J9+6hUigYKVip4JxgKR5P3dWDQRQEU3rG7txfHR5Jr+r4rmMbGlF92t0Yezrng6Y5l1nD9+SkZ00nTqHa7nZIHQpOltjvqVAYC0+V2O2rUhgLTI/W7qpQGAtBg9Hm2YQ4CSxEZ6fgxvLPH+lOTdnj6ZhsOkNkpe1+S2M3BCdbqNtlKBkzV5vr3WVXEA5ZsNzurFQXE2qi3vcKMkkz');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning && !isBreakTime) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBreakTime(true)
            setIsRunning(false)
            playBreakNotification()
            if (onBreakTime) onBreakTime()
            return breakDuration
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isBreakTime, breakDuration, onBreakTime])

  const playBreakNotification = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
    
    // Browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusFlow Break Time!', {
        body: reminderText,
        icon: '/favicon.ico'
      })
    }
  }

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    requestNotificationPermission()
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreakTime(false)
    setTimeLeft(intervalMinutes * 60)
  }

  const finishBreak = () => {
    setIsBreakTime(false)
    setTimeLeft(intervalMinutes * 60)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = isBreakTime 
    ? ((breakDuration - timeLeft) / breakDuration) * 100
    : ((intervalMinutes * 60 - timeLeft) / (intervalMinutes * 60)) * 100

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isBreakTime ? 'Break Time!' : 'Focus Timer'}
          </h3>
        </div>

        {/* Timer Display */}
        <div className="mb-6">
          <div className={`text-6xl font-bold mb-2 ${
            isBreakTime ? 'text-green-600' : 'text-blue-600'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-gray-600">
            {isBreakTime ? reminderText : `Next break in ${intervalMinutes} minutes`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              isBreakTime ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isBreakTime ? (
            <>
              {!isRunning ? (
                <Button onClick={startTimer} className="flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  Start Focus Session
                </Button>
              ) : (
                <Button onClick={pauseTimer} variant="secondary" className="flex items-center">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={resetTimer} variant="secondary" className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center text-green-700 mb-2">
                  <Bell className="w-5 h-5 mr-2" />
                  <span className="font-medium">Break Time Activity Suggestions:</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Take 5 deep breaths</li>
                  <li>• Do 10 jumping jacks</li>
                  <li>• Stretch your arms and neck</li>
                  <li>• Walk around the classroom</li>
                  <li>• Drink some water</li>
                </ul>
              </div>
              <Button onClick={finishBreak} className="w-full">
                Finish Break & Continue
              </Button>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Break interval: {intervalMinutes} min</span>
            <span>•</span>
            <span>Break duration: {breakDuration / 60} min</span>
          </div>
        </div>
      </div>
    </div>
  )
}