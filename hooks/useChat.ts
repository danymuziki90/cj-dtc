'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  roomId: string
}

interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'direct' | 'group'
  participants: string[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
  avatar?: string
  isOnline?: boolean
}

interface TypingUser {
  userId: string
  userName: string
  isTyping: boolean
  lastSeen: string
}

export const useChat = (roomId?: string) => {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    const connectWebSocket = () => {
      setIsConnected(true)
      if (roomId) {
        loadMessages(roomId)
      }
    }

    connectWebSocket()
    
    return () => {
      setIsConnected(false)
    }
  }, [roomId])

  const loadMessages = async (roomId: string) => {
    try {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: '1',
          senderName: 'Admin',
          content: 'Bienvenue dans le chat !',
          timestamp: new Date().toISOString(),
          read: true,
          type: 'text',
          roomId
        },
        {
          id: '2',
          senderId: '2',
          senderName: 'Étudiant',
          content: 'Bonjour, j\'ai une question sur la formation',
          timestamp: new Date().toISOString(),
          read: true,
          type: 'text',
          roomId
        }
      ]
      
      setMessages(mockMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (content: string, type: Message['type'] = 'text', fileUrl?: string, fileName?: string, fileSize?: number) => {
    if (!isConnected || !currentRoom || !session) {
      return
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: (session.user?.id as string) || 'anonymous',
      senderName: (session.user?.name as string) || 'Anonymous',
      senderAvatar: session.user?.image,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      fileUrl,
      fileName,
      fileSize,
      roomId: currentRoom.id
    }

    setMessages(prev => [...prev, message])
    console.log('Sending message:', message)
    return message
  }

  const markAsRead = (id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
      )
    )
  }

  const markAllAsRead = () => {
    setMessages(prev => 
      prev.map(msg => ({ ...msg, read: true }))
    )
  }

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(n => n.id !== id))
  }

  const editMessage = (id: string, newContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, content: newContent } : msg
      )
    )
  }

  const createRoom = async (roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>) => {
    const newRoom: ChatRoom = {
      ...roomData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    }

    setRooms(prev => [...prev, newRoom])
    return newRoom
  }

  const joinRoom = (room: ChatRoom) => {
    setCurrentRoom(room)
    loadMessages(room.id)
  }

  const leaveRoom = () => {
    setCurrentRoom(null)
    setMessages([])
  }

  const getUsersInRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    return room ? room.participants : []
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers.includes(userId)
  }

  const getUnreadCount = () => {
    return messages.filter(n => !n.read).length
  }

  return {
    messages,
    rooms,
    currentRoom,
    typingUsers,
    isConnected,
    isTyping,
    onlineUsers,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    editMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    getUsersInRoom,
    isUserOnline,
    getUnreadCount
  }
}
