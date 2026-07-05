'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
  icon?: string
  autoClose?: boolean
  duration?: number
}

export const usePushNotifications = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  const sendLocalNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!isSupported || permission !== 'granted') {
      return
    }

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }

    const notificationInstance = new Notification(notification.title, {
      body: notification.message,
      icon: notification.icon || '/favicon.ico',
      tag: newNotification.id,
      data: newNotification,
      requireInteraction: notification.type === 'error',
      silent: false
    })

    notificationInstance.onclick = () => {
      if (notification.actionUrl) {
        window.open(notification.actionUrl, '_blank')
      }
      notificationInstance.close()
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000
      setTimeout(() => {
        markAsRead(newNotification.id)
      }, duration)
    }

    return newNotification
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length
  }

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(n => n.type === type)
  }

  const getRecentNotifications = (limit: number = 10) => {
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  return {
    notifications,
    permission,
    isSupported,
    requestPermission,
    sendLocalNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    getUnreadCount,
    getNotificationsByType,
    getRecentNotifications
  }
}
