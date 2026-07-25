import api from './apiService';
import { User, DoctorProfile } from '../types';

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
};
