export type DashboardPayload = {
  student?: {
    id?: number
    fullName?: string
    firstName?: string
    lastName?: string
    photoUrl?: string
    status?: string
    whatsapp?: string
    email?: string
  }
  dashboard?: {
    metrics?: Record<string, any>
    progress?: {
      hoursCompleted?: number
      hoursRemaining?: number
    }
    submissions?: any[]
    notifications?: any[]
    questions?: any[]
    resources?: any[]
    sessionsHistory?: any[]
    availableSessions?: any[]
    certificates?: any[]
    certificateEligibility?: {
      eligible?: boolean
      projectValidated?: boolean
      attendanceValidated?: boolean
      attendanceRate?: number | null
    }
    currentSession?: {
      formationTitle?: string
      startDate?: string
      endDate?: string
      location?: string
      format?: string
    }
    news?: any[]
    assignments?: any[]
  }
}

export type CalendarEvent = {
  id: string
  date: Date
  title: string
  description: string
  category: string
  icon: any
  color: string
}
