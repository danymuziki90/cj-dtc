'use client'

import React, { useState } from 'react'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'md', 
  interactive = false, 
  onRatingChange, 
  readonly = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [currentRating, setCurrentRating] = useState(rating)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && !readonly) {
      setCurrentRating(starRating)
      onRatingChange?.(starRating)
    }
  }

  const handleStarHover = (starRating: number) => {
    if (interactive && !readonly) {
      setHoverRating(starRating)
    }
  }

  const handleStarLeave = () => {
    if (interactive && !readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div 
      className={`flex ${interactive && !readonly ? 'cursor-pointer' : ''}`}
      onMouseLeave={handleStarLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || currentRating)
        return (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive && !readonly ? 'hover:text-yellow-400' : ''}`}
            fill={isFilled ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        )
      })}
    </div>
  )
}
