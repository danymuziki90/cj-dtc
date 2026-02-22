'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Bookmark {
  id: string
  type: 'formation' | 'session' | 'document' | 'video'
  itemId: number
  title: string
  description: string
  url: string
  thumbnail?: string
  createdAt: string
  tags?: string[]
}

export const useBookmarks = () => {
  const { data: session } = useSession()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarks')
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks))
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error)
      }
    }

    loadBookmarks()
  }, [])

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    try {
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
      setBookmarks(newBookmarks)
    } catch (error) {
      console.error('Error saving bookmarks:', error)
    }
  }

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }

    saveBookmarks([...bookmarks, newBookmark])
    return newBookmark
  }

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id)
    saveBookmarks(newBookmarks)
  }

  const isBookmarked = (type: string, itemId: number) => {
    return bookmarks.some(b => b.type === type && b.itemId === itemId)
  }

  const toggleBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (isBookmarked(bookmark.type, bookmark.itemId)) {
      const existingBookmark = bookmarks.find(b => b.type === bookmark.type && b.itemId === bookmark.itemId)
      if (existingBookmark) {
        removeBookmark(existingBookmark.id)
      }
      return false
    } else {
      addBookmark(bookmark)
      return true
    }
  }

  const getBookmarksByType = (type: Bookmark['type']) => {
    return bookmarks.filter(b => b.type === type)
  }

  const getRecentBookmarks = (limit: number = 5) => {
    return bookmarks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  return {
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    getBookmarksByType,
    getRecentBookmarks
  }
}
