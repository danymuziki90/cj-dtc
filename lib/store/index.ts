// CJ DTC - Zustand Store
// Version 2.0 - Production Ready

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { User, UserRole, Enrollment, Certificate, Formation } from '@/types'

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: Date | null
  
  // Actions
  login: (user: User, accessToken: string, refreshToken: string, expiresAt: Date) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  setTokens: (accessToken: string, refreshToken: string, expiresAt: Date) => void
  clearTokens: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,

        login: (user, accessToken, refreshToken, expiresAt) => {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            accessToken,
            refreshToken,
            expiresAt,
          })
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          })
        },

        updateUser: (userData) => {
          const currentUser = get().user
          if (currentUser) {
            set({
              user: { ...currentUser, ...userData },
            })
          }
        },

        setLoading: (loading) => {
          set({ isLoading: loading })
        },

        setTokens: (accessToken, refreshToken, expiresAt) => {
          set({ accessToken, refreshToken, expiresAt })
        },

        clearTokens: () => {
          set({ accessToken: null, refreshToken: null, expiresAt: null })
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for security
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          expiresAt: state.expiresAt,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// Student Dashboard Store
interface StudentDashboardState {
  enrollments: Enrollment[]
  certificates: Certificate[]
  upcomingAssignments: any[]
  recentSubmissions: any[]
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalCertificates: number
    averageGrade: number
  }
  isLoading: boolean
  
  // Actions
  setEnrollments: (enrollments: Enrollment[]) => void
  setCertificates: (certificates: Certificate[]) => void
  setUpcomingAssignments: (assignments: any[]) => void
  setRecentSubmissions: (submissions: any[]) => void
  setStats: (stats: StudentDashboardState['stats']) => void
  setLoading: (loading: boolean) => void
  addEnrollment: (enrollment: Enrollment) => void
  updateEnrollment: (id: number, data: Partial<Enrollment>) => void
  addCertificate: (certificate: Certificate) => void
  refreshData: () => Promise<void>
}

export const useStudentStore = create<StudentDashboardState>()(
  devtools(
    (set, get) => ({
      enrollments: [],
      certificates: [],
      upcomingAssignments: [],
      recentSubmissions: [],
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalCertificates: 0,
        averageGrade: 0,
      },
      isLoading: false,

      setEnrollments: (enrollments) => {
        set({ enrollments })
      },

      setCertificates: (certificates) => {
        set({ certificates })
      },

      setUpcomingAssignments: (assignments) => {
        set({ upcomingAssignments: assignments })
      },

      setRecentSubmissions: (submissions) => {
        set({ recentSubmissions: submissions })
      },

      setStats: (stats) => {
        set({ stats })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      addEnrollment: (enrollment) => {
        const currentEnrollments = get().enrollments
        set({ enrollments: [...currentEnrollments, enrollment] })
      },

      updateEnrollment: (id, data) => {
        const currentEnrollments = get().enrollments
        const updatedEnrollments = currentEnrollments.map(enrollment =>
          enrollment.id === id ? { ...enrollment, ...data } : enrollment
        )
        set({ enrollments: updatedEnrollments })
      },

      addCertificate: (certificate) => {
        const currentCertificates = get().certificates
        set({ certificates: [...currentCertificates, certificate] })
      },

      refreshData: async () => {
        set({ isLoading: true })
        try {
          // This would typically fetch data from the API
          // For now, we'll just set loading to false
          set({ isLoading: false })
        } catch (error) {
          console.error('Failed to refresh student data:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'student-store',
    }
  )
)

// Formation Store
interface FormationState {
  formations: Formation[]
  featuredFormations: Formation[]
  categories: string[]
  searchResults: Formation[]
  filters: {
    category?: string
    type?: string
    priceRange?: { min: number; max: number }
    format?: string
    language?: string
  }
  isLoading: boolean
  searchQuery: string
  
  // Actions
  setFormations: (formations: Formation[]) => void
  setFeaturedFormations: (formations: Formation[]) => void
  setCategories: (categories: string[]) => void
  setSearchResults: (results: Formation[]) => void
  setFilters: (filters: Partial<FormationState['filters']>) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  searchFormations: (query: string) => void
  filterFormations: () => void
  clearFilters: () => void
}

export const useFormationStore = create<FormationState>()(
  devtools(
    (set, get) => ({
      formations: [],
      featuredFormations: [],
      categories: [],
      searchResults: [],
      filters: {},
      isLoading: false,
      searchQuery: '',

      setFormations: (formations) => {
        set({ formations })
        
        // Extract categories
        const categories = [...new Set(formations.map(f => f.category).filter(Boolean))]
        set({ categories })
        
        // Set featured formations
        const featured = formations.filter(f => f.featured)
        set({ featuredFormations: featured })
      },

      setFeaturedFormations: (featuredFormations) => {
        set({ featuredFormations })
      },

      setCategories: (categories) => {
        set({ categories })
      },

      setSearchResults: (searchResults) => {
        set({ searchResults })
      },

      setFilters: (filters) => {
        const currentFilters = get().filters
        set({ filters: { ...currentFilters, ...filters } })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setSearchQuery: (searchQuery) => {
        set({ searchQuery })
      },

      searchFormations: (query) => {
        const { formations } = get()
        const filtered = formations.filter(formation =>
          formation.title.toLowerCase().includes(query.toLowerCase()) ||
          formation.description.toLowerCase().includes(query.toLowerCase()) ||
          formation.category?.toLowerCase().includes(query.toLowerCase())
        )
        set({ searchResults: filtered, searchQuery: query })
      },

      filterFormations: () => {
        const { formations, filters } = get()
        let filtered = formations

        if (filters.category) {
          filtered = filtered.filter(f => f.category === filters.category)
        }

        if (filters.type) {
          filtered = filtered.filter(f => f.type === filters.type)
        }

        if (filters.priceRange) {
          filtered = filtered.filter(f => 
            f.price >= filters.priceRange!.min && f.price <= filters.priceRange!.max
          )
        }

        if (filters.format) {
          filtered = filtered.filter(f => f.format === filters.format)
        }

        if (filters.language && filters.language.length > 0) {
          filtered = filtered.filter(f => 
            f.language.some(lang => filters.language!.includes(lang))
          )
        }

        set({ searchResults: filtered })
      },

      clearFilters: () => {
        set({ 
          filters: {}, 
          searchResults: [], 
          searchQuery: '' 
        })
      },
    }),
    {
      name: 'formation-store',
    }
  )
)

// UI Store
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
  notifications: any[]
  modals: {
    login: boolean
    register: boolean
    contact: boolean
    enrollment: boolean
  }
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'fr' | 'en') => void
  addNotification: (notification: any) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: false,
        theme: 'system',
        language: 'fr',
        notifications: [],
        modals: {
          login: false,
          register: false,
          contact: false,
          enrollment: false,
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open })
        },

        setTheme: (theme) => {
          set({ theme })
        },

        setLanguage: (language) => {
          set({ language })
        },

        addNotification: (notification) => {
          const currentNotifications = get().notifications
          set({
            notifications: [...currentNotifications, {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
              read: false,
            }],
          })
        },

        removeNotification: (id) => {
          const currentNotifications = get().notifications
          set({
            notifications: currentNotifications.filter(n => n.id !== id),
          })
        },

        clearNotifications: () => {
          set({ notifications: [] })
        },

        openModal: (modal) => {
          const currentModals = get().modals
          set({
            modals: { ...currentModals, [modal]: true },
          })
        },

        closeModal: (modal) => {
          const currentModals = get().modals
          set({
            modals: { ...currentModals, [modal]: false },
          })
        },

        closeAllModals: () => {
          set({
            modals: {
              login: false,
              register: false,
              contact: false,
              enrollment: false,
            },
          })
        },
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
)

// Admin Store
interface AdminState {
  stats: {
    totalStudents: number
    activeStudents: number
    totalFormations: number
    totalEnrollments: number
    totalRevenue: number
    completionRate: number
    satisfactionScore: number
  }
  recentEnrollments: Enrollment[]
  upcomingSessions: any[]
  pendingPayments: any[]
  systemAlerts: any[]
  isLoading: boolean
  
  // Actions
  setStats: (stats: AdminState['stats']) => void
  setRecentEnrollments: (enrollments: Enrollment[]) => void
  setUpcomingSessions: (sessions: any[]) => void
  setPendingPayments: (payments: any[]) => void
  setSystemAlerts: (alerts: any[]) => void
  setLoading: (loading: boolean) => void
  refreshData: () => Promise<void>
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      stats: {
        totalStudents: 0,
        activeStudents: 0,
        totalFormations: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        completionRate: 0,
        satisfactionScore: 0,
      },
      recentEnrollments: [],
      upcomingSessions: [],
      pendingPayments: [],
      systemAlerts: [],
      isLoading: false,

      setStats: (stats) => {
        set({ stats })
      },

      setRecentEnrollments: (recentEnrollments) => {
        set({ recentEnrollments })
      },

      setUpcomingSessions: (upcomingSessions) => {
        set({ upcomingSessions })
      },

      setPendingPayments: (pendingPayments) => {
        set({ pendingPayments })
      },

      setSystemAlerts: (systemAlerts) => {
        set({ systemAlerts })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      refreshData: async () => {
        set({ isLoading: true })
        try {
          // This would typically fetch data from the API
          // For now, we'll just set loading to false
          set({ isLoading: false })
        } catch (error) {
          console.error('Failed to refresh admin data:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'admin-store',
    }
  )
)

// Combined selectors for easier access
export const useStore = () => {
  const auth = useAuthStore()
  const student = useStudentStore()
  const formation = useFormationStore()
  const ui = useUIStore()
  const admin = useAdminStore()

  return {
    auth,
    student,
    formation,
    ui,
    admin,
  }
}

// Selectors for specific data
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === UserRole.ADMIN)
export const useIsStudent = () => useAuthStore((state) => state.user?.role === UserRole.STUDENT)
export const useCurrentTheme = () => useUIStore((state) => state.theme)
export const useCurrentLanguage = () => useUIStore((state) => state.language)
export const useFormations = () => useFormationStore((state) => state.formations)
export const useFeaturedFormations = () => useFormationStore((state) => state.featuredFormations)
export const useEnrollments = () => useStudentStore((state) => state.enrollments)
export const useCertificates = () => useStudentStore((state) => state.certificates)
