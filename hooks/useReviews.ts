'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  wouldRecommend: boolean
  createdAt: string
  updatedAt: string
  helpful: number
  notHelpful: number
  verified: boolean
  formationId: number
  sessionId?: number
}

interface Rating {
  id: string
  userId: string
  formationId: number
  sessionId?: number
  rating: number
  categories: {
    content: number
    instructor: number
    material: number
    support: number
    overall: number
  }
  createdAt: string
  updatedAt: string
}

interface ReviewFilter {
  rating?: number
  wouldRecommend?: boolean
  verified?: boolean
  sortBy?: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful'
  formationId?: number
  sessionId?: number
}

export const useReviews = () => {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<ReviewFilter>({})

  const loadReviews = async (formationId?: number) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockReviews: Review[] = [
        {
          id: '1',
          userId: '1',
          userName: 'Jean Dupont',
          userAvatar: '/images/avatar1.jpg',
          rating: 5,
          title: 'Formation excellente !',
          content: 'Cette formation a dépassé mes attentes. Le contenu est très bien structuré et les formateurs sont compétents.',
          pros: ['Contenu riche', 'Formateurs expérimentés', 'Support réactif'],
          cons: ['Durée un peu courte'],
          wouldRecommend: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          helpful: 12,
          notHelpful: 1,
          verified: true,
          formationId: formationId || 1
        },
        {
          id: '2',
          userId: '2',
          userName: 'Marie Martin',
          rating: 4,
          title: 'Très bonne formation',
          content: 'J\'ai beaucoup appris pendant cette formation. Le contenu est pertinent et bien présenté.',
          pros: ['Pédagogie efficace', 'Exemples pratiques'],
          cons: ['Manque de temps pour les questions'],
          wouldRecommend: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          helpful: 8,
          notHelpful: 2,
          verified: true,
          formationId: formationId || 1
        }
      ]
      
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addReview = async (reviewData: Omit<Review, 'id' | 'userId' | 'userName' | 'userAvatar' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful' | 'verified'>) => {
    if (!session) {
      throw new Error('Vous devez être connecté pour laisser un avis')
    }

    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      userId: (session.user?.id as string) || 'anonymous',
      userName: (session.user?.name as string) || 'Anonymous',
      userAvatar: session.user?.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
      verified: false
    }

    setReviews(prev => [newReview, ...prev])
    return newReview
  }

  const updateReview = async (id: string, updates: Partial<Review>) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === id 
          ? { ...review, ...updates, updatedAt: new Date().toISOString() }
          : review
      )
    )
  }

  const deleteReview = async (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id))
  }

  const rateReview = async (id: string, helpful: boolean) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === id 
          ? { 
              ...review, 
              helpful: helpful ? review.helpful + 1 : review.helpful,
              notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful
            }
          : review
      )
    )
  }

  const addRating = async (ratingData: Omit<Rating, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!session) {
      throw new Error('Vous devez être connecté pour évaluer')
    }

    const newRating: Rating = {
      ...ratingData,
      id: Date.now().toString(),
      userId: (session.user?.id as string) || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRatings(prev => [...prev, newRating])
    return newRating
  }

  const updateRating = async (id: string, updates: Partial<Rating>) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.id === id 
          ? { ...rating, ...updates, updatedAt: new Date().toISOString() }
          : rating
      )
    )
  }

  const getReviewStats = (formationId?: number) => {
    const filteredReviews = formationId 
      ? reviews.filter(r => r.formationId === formationId)
      : reviews

    if (filteredReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        wouldRecommendPercentage: 0,
        verifiedPercentage: 0
      }
    }

    const averageRating = filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length
    const ratingDistribution = [0, 0, 0, 0, 0]
    
    filteredReviews.forEach(review => {
      ratingDistribution[review.rating - 1]++
    })

    const wouldRecommendCount = filteredReviews.filter(r => r.wouldRecommend).length
    const wouldRecommendPercentage = (wouldRecommendCount / filteredReviews.length) * 100
    
    const verifiedCount = filteredReviews.filter(r => r.verified).length
    const verifiedPercentage = (verifiedCount / filteredReviews.length) * 100

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: filteredReviews.length,
      ratingDistribution,
      wouldRecommendPercentage: parseFloat(wouldRecommendPercentage.toFixed(1)),
      verifiedPercentage: parseFloat(verifiedPercentage.toFixed(1))
    }
  }

  const getFilteredReviews = () => {
    let filtered = [...reviews]

    if (filters.rating) {
      filtered = filtered.filter(review => review.rating === filters.rating)
    }
    if (filters.wouldRecommend !== undefined) {
      filtered = filtered.filter(review => review.wouldRecommend === filters.wouldRecommend)
    }
    if (filters.verified !== undefined) {
      filtered = filtered.filter(review => review.verified === filters.verified)
    }
    if (filters.formationId) {
      filtered = filtered.filter(review => review.formationId === filters.formationId)
    }
    if (filters.sessionId) {
      filtered = filtered.filter(review => review.sessionId === filters.sessionId)
    }

    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'helpful':
        filtered.sort((a, b) => b.helpful - a.helpful)
        break
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }

  const updateFilters = (newFilters: Partial<ReviewFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  return {
    reviews,
    ratings,
    isLoading,
    filters,
    loadReviews,
    addReview,
    updateReview,
    deleteReview,
    rateReview,
    addRating,
    updateRating,
    getReviewStats,
    getFilteredReviews,
    updateFilters,
    clearFilters
  }
}
