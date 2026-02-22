// CJ DTC - Type Definitions
// Version 2.0 - Production Ready

// USER TYPES
export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: Date;
  lastLoginAt?: Date;
  twoFactorEnabled: boolean;
  
  // CJ DTC Specific
  studentNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  linkedinUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  STAFF = 'STAFF',
  INSTRUCTOR = 'INSTRUCTOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

// FORMATION TYPES
export interface Formation {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  objectives?: string;
  prerequisites?: string;
  targetAudience?: string;
  
  // CJ DTC Specific
  type: FormationType;
  category: string;
  level?: string;
  duration?: string;
  credits?: number;
  
  // Pricing
  price: number;
  currency: string;
  scholarshipAvailable: boolean;
  
  // Delivery
  format: string;
  language: string[];
  timezone?: string;
  
  // Media
  imageUrl?: string;
  videoUrl?: string;
  brochureUrl?: string;
  
  // Status
  status: FormationStatus;
  featured: boolean;
  certificateTemplate?: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum FormationType {
  CERTIFICATION = 'CERTIFICATION',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  MASTERCLASS = 'MASTERCLASS',
  ONLINE_COURSE = 'ONLINE_COURSE',
  CORPORATE_TRAINING = 'CORPORATE_TRAINING',
}

export enum FormationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  INACTIVE = 'INACTIVE',
}

// ENROLLMENT TYPES
export interface Enrollment {
  id: number;
  enrollmentCode: string;
  
  // Student Information
  userId?: string;
  user?: User;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Formation
  formationId: number;
  formation: Formation;
  sessionId?: number;
  session?: TrainingSession;
  
  // Academic Info
  studentNumber?: string;
  status: EnrollmentStatus;
  progress: number;
  grade?: number;
  credits?: number;
  
  // Schedule
  startDate: Date;
  endDate?: Date;
  expectedEndDate?: Date;
  
  // Financial
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  
  // Documents
  identityDocument?: string;
  cvDocument?: string;
  motivationLetter?: string;
  
  // Corporate Info
  companyName?: string;
  companyAddress?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  
  // Analytics
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  DROPPED_OUT = 'DROPPED_OUT',
}

// TRAINING SESSION TYPES
export interface TrainingSession {
  id: number;
  formationId: number;
  formation: Formation;
  title: string;
  
  // Schedule
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  timezone: string;
  recurringPattern?: string;
  
  // Location
  location?: string;
  locationType: string;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  
  // Capacity
  maxParticipants: number;
  currentParticipants: number;
  waitlistEnabled: boolean;
  
  // Instructor
  instructorId?: string;
  instructor?: User;
  
  // Status
  status: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// CERTIFICATE TYPES
export interface Certificate {
  id: number;
  certificateNumber: string;
  qrCode: string;
  verificationUrl: string;
  
  // Recipient
  enrollmentId: number;
  enrollment: Enrollment;
  userId?: string;
  user?: User;
  holderName: string;
  holderEmail: string;
  
  // Formation
  formationId: number;
  formation: Formation;
  sessionId?: number;
  session?: TrainingSession;
  
  // Certificate Details
  type: CertificateType;
  status: CertificateStatus;
  grade?: string;
  score?: number;
  credits?: number;
  
  // Issuance
  issuedAt: Date;
  issuedBy?: string;
  validUntil?: Date;
  
  // Digital Certificate
  pdfUrl?: string;
  blockchainHash?: string;
  digitalSignature?: string;
  
  // Verification
  verificationCount: number;
  lastVerifiedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum CertificateType {
  COMPLETION = 'COMPLETION',
  ATTENDANCE = 'ATTENDANCE',
  EXCELLENCE = 'EXCELLENCE',
  MASTERY = 'MASTERY',
  SPECIALIZATION = 'SPECIALIZATION',
}

export enum CertificateStatus {
  ISSUED = 'ISSUED',
  VERIFIED = 'VERIFIED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

// DOCUMENT TYPES
export interface Document {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  type: DocumentType;
  
  // Associations
  formationId?: number;
  formation?: Formation;
  sessionId?: number;
  session?: TrainingSession;
  assignmentId?: number;
  enrollmentId?: number;
  
  // Access Control
  isPublic: boolean;
  accessLevel: string;
  downloadCount: number;
  
  // Metadata
  uploadedBy?: string;
  tags: string[];
  version: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  SYLLABUS = 'SYLLABUS',
  PRESENTATION = 'PRESENTATION',
  EXERCISE = 'EXERCISE',
  RESOURCE = 'RESOURCE',
  CERTIFICATE_TEMPLATE = 'CERTIFICATE_TEMPLATE',
  ASSIGNMENT = 'ASSIGNMENT',
  SUBMISSION = 'SUBMISSION',
  IDENTITY = 'IDENTITY',
  TRANSCRIPT = 'TRANSCRIPT',
}

// ASSIGNMENT TYPES
export interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  type: AssignmentType;
  
  // Formation
  formationId: number;
  formation: Formation;
  sessionId?: number;
  session?: TrainingSession;
  
  // Schedule
  startDate: Date;
  deadline: Date;
  lateSubmissionAllowed: boolean;
  latePenalty?: number;
  
  // Requirements
  maxFileSize: number;
  allowedFileTypes: string;
  maxAttempts: number;
  
  // Grading
  maxScore: number;
  passingScore: number;
  autoGrade: boolean;
  rubric?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  CASE_STUDY = 'CASE_STUDY',
  PRESENTATION = 'PRESENTATION',
}

// SUBMISSION TYPES
export interface Submission {
  id: number;
  assignmentId: number;
  assignment: Assignment;
  enrollmentId: number;
  enrollment: Enrollment;
  userId?: string;
  user?: User;
  
  // Submission Details
  status: SubmissionStatus;
  score?: number;
  percentage?: number;
  grade?: string;
  feedback?: string;
  instructorNotes?: string;
  
  // Timing
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  
  // Academic Integrity
  plagiarismScore?: number;
  plagiarismReport?: string;
  
  // Relations
  files: SubmissionFile[];
  
  createdAt: Date;
  updatedAt: Date;
}

export enum SubmissionStatus {
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
  PLAGIARISM_DETECTED = 'PLAGIARISM_DETECTED',
}

export interface SubmissionFile {
  id: number;
  submissionId: number;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

// PAYMENT TYPES
export interface Payment {
  id: number;
  enrollmentId: number;
  enrollment: Enrollment;
  
  // Payment Details
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId?: string;
  reference?: string;
  gateway?: string;
  
  // Dates
  paidAt?: Date;
  dueDate?: Date;
  
  // Refunds
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  
  // Metadata
  notes?: string;
  metadata?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
}

// INVOICE TYPES
export interface Invoice {
  id: number;
  enrollmentId: number;
  enrollment: Enrollment;
  
  // Invoice Details
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Status
  status: string;
  
  // Dates
  issueDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  sentAt?: Date;
  
  // Documents
  pdfUrl?: string;
  
  // Billing Info
  billingName?: string;
  billingAddress?: string;
  billingEmail?: string;
  billingPhone?: string;
  
  // Notes
  notes?: string;
  terms?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ATTENDANCE TYPES
export interface Attendance {
  id: number;
  enrollmentId: number;
  enrollment: Enrollment;
  sessionId: number;
  session: TrainingSession;
  
  // Attendance Details
  date: Date;
  status: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  duration?: number;
  
  // Notes
  notes?: string;
  instructorNotes?: string;
  
  // Metadata
  recordedBy?: string;
  recordedAt: Date;
}

// API RESPONSE TYPES
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// FORM TYPES
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  agreeTerms: boolean;
}

export interface EnrollmentForm {
  formationId: number;
  sessionId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  motivationLetter?: string;
  companyName?: string;
  companyAddress?: string;
  source?: string;
}

export interface PaymentForm {
  enrollmentId: number;
  amount: number;
  method: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

// DASHBOARD TYPES
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalFormations: number;
  totalEnrollments: number;
  totalRevenue: number;
  completionRate: number;
  satisfactionScore: number;
}

export interface StudentDashboard {
  user: User;
  enrollments: Enrollment[];
  upcomingAssignments: Assignment[];
  recentSubmissions: Submission[];
  certificates: Certificate[];
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalCertificates: number;
    averageGrade: number;
  };
}

export interface AdminDashboard {
  stats: DashboardStats;
  recentEnrollments: Enrollment[];
  upcomingSessions: TrainingSession[];
  pendingPayments: Payment[];
  systemAlerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// SEARCH & FILTER TYPES
export interface SearchFilters {
  query?: string;
  category?: string;
  type?: FormationType;
  status?: FormationStatus;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: string;
  format?: string;
  language?: string;
  sortBy?: 'title' | 'price' | 'duration' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: number;
  type: 'formation' | 'document' | 'instructor';
  title: string;
  description: string;
  url: string;
  score: number;
  highlights?: string[];
}

// NOTIFICATION TYPES
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  createdAt: Date;
}

// CONFIGURATION TYPES
export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppConfig {
  siteName: string;
  siteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  features: {
    enableRegistration: boolean;
    enablePayments: boolean;
    enableCertificates: boolean;
    enableWaitlist: boolean;
    enableNotifications: boolean;
  };
}
