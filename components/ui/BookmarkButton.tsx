'use client'

import React, { useState } from 'react'
import { useBookmarks } from '../../hooks/useBookmarks'

interface BookmarkButtonProps {
  type: 'formation' | 'session' | 'document' | 'video'
  itemId: number
  title: string
  description: string
  url: string
  thumbnail?: string
  tags?: string[]
  className?: string
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  type,
  itemId,
  title,
  description,
  url,
  thumbnail,
  tags,
  className = ''
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [isBookmarkedState, setIsBookmarkedState] = useState(false)

  React.useEffect(() => {
    setIsBookmarkedState(isBookmarked(type, itemId))
  }, [isBookmarked, type, itemId])

  const handleToggle = () => {
    const bookmark = {
      type,
      itemId,
      title,
      description,
      url,
      thumbnail,
      tags
    }
    
    const newState = toggleBookmark(bookmark)
    setIsBookmarkedState(newState)
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        isBookmarkedState
          ? 'bg-cjblue text-white hover:bg-blue-600'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      } ${className}`}
      title={isBookmarkedState ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg
        className="w-5 h-5"
        fill={isBookmarkedState ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
