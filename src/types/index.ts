export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  createdAt?: string;
}

export type DoctorRank = 'GENERAL_PRACTITIONER' | 'SPECIALIST' | 'CONSULTANT';

export type QualificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// مؤهل معتمد كما يراه المريض
export interface QualificationPublic {
  id: number;
  degreeName: string;
  institution: string;
  fieldOfStudy?: string | null;
  yearObtained?: number | null;
}

// مؤهل كما يراه الطبيب صاحبه: مع حالة المراجعة وسبب الرفض
export interface MyQualification extends QualificationPublic {
  status: QualificationStatus;
  rejectionReason?: string | null;
}

// عنصر في قائمة مراجعة المشرف
export interface QualificationReviewItem extends QualificationPublic {
  doctorId: number;
  doctorName: string;
  specialty: string;
  status: QualificationStatus;
}

export interface DoctorPublic {
  id: number;
  fullName: string;
  specialty: string;
  pricePerSession: number;
  bio?: string | null;
  rank?: DoctorRank | null;
  yearsOfExperience?: number | null;
  profilePictureUrl?: string | null;
  doctorQualification?: QualificationPublic[];
  rating?: number;
  reviewsCount?: number;
  verificationStatus?: string;
}

export interface DoctorProfile {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  licenseNumber: string;
  pricePerSession: number;
  bio?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  licenseDocumentUrl?: string;
  rank?: DoctorRank | null;
  yearsOfExperience?: number | null;
  profilePictureUrl?: string | null;
  doctorQualification?: MyQualification[];
}

export interface Appointment {
  id: number;
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  consultationType: 'CALL' | 'CHAT';
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  meetingLink?: string;
}

export interface Message {
  id: number;
  appointmentId: number;
  senderId: number;
  senderName: string;
  content: string;
  read: boolean;
  sentAt: string;
  attachmentUrl?: string;
}

export interface Payment {
  paymentId: number;
  amount: number;
  transactionReference: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  checkoutUrl: string;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Availability {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface ChatbotMessage {
  conversationId: number;
  senderType: 'USER' | 'BOT';
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatConversationSummary {
  id: number;
  title: string;
  updatedAt: string;
}

export interface APIResponse<T = unknown> {
  message?: string;
  data?: T;
}