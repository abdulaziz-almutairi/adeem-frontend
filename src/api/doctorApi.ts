import api from './apiService';
import { DoctorPublic, DoctorProfile } from '../types';

export const doctorApi = {
  // قائمة الأطباء الموثقين (عام، بدون تسجيل دخول) - GET /doctors/verified
  getVerifiedDoctors: async (): Promise<DoctorPublic[]> => {
    const response = await api.get('/doctors/verified');
    return response.data;
  },

  // بروفايلي أنا (الطبيب المسجل دخوله) - GET /doctors/me
  getMyProfile: async (): Promise<DoctorProfile> => {
    const response = await api.get('/doctors/me');
    return response.data;
  },
};
