import api, { API_ORIGIN } from './apiService';
import { User, DoctorProfile, QualificationReviewItem } from '../types';

export const adminApi = {
  // طلبات توثيق الأطباء المعلقة - GET /doctors/pending (ADMIN فقط)
  getPendingDoctors: async (): Promise<DoctorProfile[]> => {
    const response = await api.get('/doctors/pending');
    return response.data;
  },

  // قبول أو رفض طلب توثيق طبيب - PUT /doctors/{doctorProfileId}/verification (ADMIN فقط)
  updateDoctorVerification: async (doctorProfileId: number, status: 'VERIFIED' | 'REJECTED'): Promise<void> => {
    await api.put(`/doctors/${doctorProfileId}/verification`, { status });
  },

  // كل المستخدمين - GET /users (ADMIN فقط)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // حذف مستخدم - DELETE /users/{id} (ADMIN فقط)
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // المؤهلات بانتظار المراجعة - GET /api/doctors/qualifications/pending (ADMIN فقط)
  getPendingQualifications: async (): Promise<QualificationReviewItem[]> => {
    const response = await api.get(`${API_ORIGIN}/api/doctors/qualifications/pending`);
    return response.data;
  },

  // اعتماد أو رفض مؤهل؛ السبب إلزامي عند الرفض - PUT /api/doctors/qualifications/{id}/review (ADMIN فقط)
  reviewQualification: async (qualificationId: number, status: 'APPROVED' | 'REJECTED', reason?: string): Promise<void> => {
    await api.put(`${API_ORIGIN}/api/doctors/qualifications/${qualificationId}/review`, { status, reason });
  },
};
