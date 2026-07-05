'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  const setTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useThemeClasses = () => {
  const { theme } = useTheme()
  
  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
    bgSecondary: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
    hoverBg: theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    hoverBorder: theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-400',
    focusRing: theme === 'dark' ? 'ring-cjblue focus:ring-offset-2 focus:ring-offset-2 focus:ring-cjblue focus:ring-offset-2 focus:ring-offset-2' : 'focus:ring-cjblue focus:ring-offset-2 focus:ring-offset-2',
    focusVisible: theme === 'dark' ? 'focus:ring-cjblue focus:ring-offset-2 focus:ring-offset-2' : 'focus:ring-cjblue focus:ring-offset-2 focus:ring-offset-2',
  }
}

export const useThemeColors = () => {
  const { theme } = useTheme()
  
  return {
    theme,
    colors: {
      primary: theme === 'dark' ? 'bg-cjblue' : 'bg-cjblue',
      secondary: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500',
      accent: theme === 'dark' ? 'bg-green-600' : 'bg-green-500',
      destructive: theme === 'dark' ? 'bg-red-600' : 'bg-red-500',
      muted: theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100',
      accentHover: theme === 'dark' ? 'bg-green-700' : 'bg-green-600',
      destructiveHover: theme === 'dark' ? 'bg-red-700' : 'bg-red-600',
      success: theme === 'dark' ? 'bg-green-600' : 'bg-green-500',
      warning: theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500',
      info: theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
    }
  }
}

// Hook pour les classes de thème conditionnelles
export const useConditionalClasses = (classes: string) => {
  const { theme } = useTheme()
  
  return `${classes} ${theme === 'dark' ? 'dark' : 'light'}`
}

// Hook pour les couleurs de thème
export const useThemeColors = () => {
  const { colors } = useThemeColors()
  
  return {
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-300',
    bg: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
    bgSecondary: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
  }
}
