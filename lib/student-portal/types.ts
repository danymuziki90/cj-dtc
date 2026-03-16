export type StudentPortalPayload = {
  student: {
    id: string
    fullName: string
    firstName: string
    lastName: string
    username: string | null
    email: string
    whatsapp: string | null
    status: string
    address: string | null
    city: string | null
    country: string | null
    createdAt: string
    photoUrl: string | null
  }
  dashboard: {
    currentSession: {
      enrollmentId: number
      formationTitle: string
      sessionId: number | null | undefined
      sessionType: string | null | undefined
      startDate: string | null | undefined
      endDate: string | null | undefined
      location: string | null | undefined
      format: string | null | undefined
      status: string
      sessionStatus: string | null | undefined
      lifecycle: string
      availableSpots: number | null
      reservedSpot: number | null
      waitlistPosition: number | null
      maxParticipants: number | null
      currentParticipants: number | null
      paymentStatus: string
      paidAmount: number
      totalAmount: number
      balanceAmount: number
    } | null
    sessionsHistory: Array<{
      enrollmentId: number
      formationTitle: string
      formationCategory: string | null
      sessionId: number
      sessionType: string | null
      startDate: string
      endDate: string
      location: string
      format: string
      sessionStatus: string
      sessionLifecycle: string
      enrollmentStatus: string
      paymentStatus: string
      totalAmount: number
      paidAmount: number
      balanceAmount: number
      waitlistPosition: number | null
      reservedSpot: number | null
      questionsCount: number
      hours: number
    }>
    resources: Array<{
      id: number
      title: string
      description: string | null
      category: string
      filePath: string
      fileName: string
      isPublic: boolean
      createdAt: string
      formationId: number | null
      sessionId: number | null
      formation: {
        id: number
        title: string
      } | null
      session: {
        id: number
        startDate: string
        endDate: string
        location: string | null
        format: string
      } | null
    }>
    payments: Array<{
      id: number
      amount: number
      method: string
      status: string
      reference: string | null
      transactionId: string | null
      paidAt: string | null
      createdAt: string
      gateway: string | null
      operator: string | null
      proofUrl: string | null
      formationTitle: string
      enrollmentId: number
      session: {
        id: number
        startDate: string
        endDate: string
        location: string | null
      } | null
      enrollmentPaymentStatus: string
      enrollmentPaidAmount: number
      enrollmentTotalAmount: number
    }>
    submissions: Array<{
      id: string
      title: string
      status: string
      submittedAt: string
      updatedAt: string
      reviewFeedback: string | null
      reviewedAt: string | null
      reviewStatus: string | null
      fileUrl: string
    }>
    certificates: Array<{
      id: string
      code: string
      type: string
      holderName: string
      issuedAt: string
      verified: boolean
      source: string
      title?: string
      fileUrl: string | null
      formation: {
        title: string
      } | null
    }>
    certificateEligibility: {
      paymentValidated: boolean
      projectValidated: boolean
      attendanceTracked: boolean
      attendanceRate: number | null
      attendanceValidated: boolean
      eligible: boolean
    }
    questions: Array<{
      id: string
      message: string
      createdAt: string
      status: string
      subject?: string | null
      category?: string | null
      priority?: string | null
      assignedAdminUsername?: string | null
      responseDueAt?: string | null
      lastUpdatedAt?: string | null
      attachments?: Array<{
        id: string
        fileName: string
        fileUrl: string
        mimeType: string
        size: number
        uploadedAt: string
      }>
      messages?: Array<{
        id: string
        senderRole: 'student' | 'admin'
        senderName: string
        message: string
        createdAt: string
        templateKey?: string | null
        attachments?: Array<{
          id: string
          fileName: string
          fileUrl: string
          mimeType: string
          size: number
          uploadedAt: string
        }>
      }>
      adminReply?: string | null
      adminReplyAt?: string | null
      formationTitle: string
      enrollmentId: number
      sessionId?: number | null
    }>
    notifications: Array<{
      id: string
      type: 'info' | 'reminder' | 'correction'
      title: string
      message: string
      createdAt: string
      source?: string
    }>
    attendance: Array<{
      id: number
      enrollmentId: number
      sessionId: number
      date: string
      status: string
      notes: string | null
      recordedAt: string
      formationTitle: string
      sessionLabel: string
    }>
    results: Array<{
      id: number
      enrollmentId: number
      formationTitle: string
      sessionLabel: string
      overallRating: number
      overallComment: string | null
      contentRating: number | null
      instructorRating: number | null
      materialRating: number | null
      organizationRating: number | null
      facilityRating: number | null
      strengths: string | null
      improvements: string | null
      recommendations: string | null
      submittedAt: string
      isAnonymous: boolean
    }>
    progress: {
      hoursCompleted: number
      hoursRemaining: number
      exercisesCompleted: number
      exercisesInProgress: number
      projectsCompleted: number
      evaluationsCompleted: number
    }
    metrics: {
      totalSessions: number
      completedSessions: number
      pendingSessions: number
      totalPayments: number
      successfulPayments: number
    }
  }
}
