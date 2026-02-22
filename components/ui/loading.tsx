'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LoadingContextType {
  isLoading: boolean
  loadingMessage?: string
  progress?: number
  showProgress: boolean
  setLoading: (loading: boolean, message?: string, progress?: number) => void
  showProgressBar: (show: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)

  const setLoading = (loading: boolean, message?: string, progress?: number) => {
    setIsLoading(loading)
    setLoadingMessage(message)
    if (progress !== undefined) {
      setProgress(progress)
    }
  }

  const showProgressBar = (show: boolean) => {
    setShowProgress(show)
  }

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      progress,
      showProgress,
      setLoading,
      showProgressBar
    }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

const LoadingOverlay: React.FC = () => {
  const { loadingMessage, progress, showProgress } = useLoading()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cjblue border-t-transparent border-r-transparent border-b-transparent"></div>
          <div className="text-lg font-semibold text-gray-900">
            {loadingMessage || 'Chargement en cours...'}
          </div>
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-cjblue h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook pour faciliter l'utilisation
export const useLoadingState = () => {
  const { setLoading } = useLoading()

  const startLoading = (message?: string, showProgressBar?: boolean) => {
    setLoading(true, message, showProgressBar ? 0 : undefined)
  }

  const updateProgress = (progress: number) => {
    setLoading(true, undefined, progress)
  }

  const stopLoading = () => {
    setLoading(false)
  }

  return {
    startLoading,
    updateProgress,
    stopLoading,
    isLoading: useLoading().isLoading
  }
}

// Composant de chargement pour les pages
export const PageLoader: React.FC<{
  isLoading?: boolean
  message?: string
  children: React.ReactNode
}> = ({ 
  isLoading = false, 
  message = 'Chargement...', 
  children 
}) => {
  const { isLoading: isPageLoading } = useLoading()

  React.useEffect(() => {
    isPageLoading !== isLoading && setLoading(isLoading, message)
  }, [isLoading, message, isPageLoading])

  if (!isPageLoading) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cjblue border-t-transparent border-r-transparent border-b-transparent"></div>
        <p className="mt-4 text-lg text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Spinner component
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-cjblue border-t-transparent border-r-transparent border-b-transparent ${sizeClasses[size]} ${className}`}></div>
  )
}

// Barre de progression
export const ProgressBar: React.FC<{
  progress: number
  className?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow'
}> = ({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className={`w-full ${colorClasses[color]} rounded-full h-2 ${className}`}>
      <div 
        className="bg-white h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
      {showPercentage && (
        <div className="text-white text-xs font-medium text-center pt-1">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
