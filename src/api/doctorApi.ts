import api, { API_ORIGIN } from './apiService';
import { DoctorPublic, DoctorProfile, MyQualification } from '../types';

// مسارات المؤهلات تحت /api/doctors (بدون /v1)، لذلك تُستدعى عبر أصل السيرفر
const QUALIFICATIONS = `${API_ORIGIN}/api/doctors`;

export interface QualificationInput {
  degreeName: string;
  institution: string;
  fieldOfStudy?: string;
  yearObtained?: number;
}

export const doctorApi = {
  // قائمة الأطباء الموثقين (عام، بدون تسجيل دخول) - GET /doctors/verified
  getVerifiedDoctors: async (): Promise<DoctorPublic[]> => {
    const response = await api.get('/doctors/verified');
    return response.data;
  },

  // ملف طبيب موثق واحد للمرضى - GET /doctors/{id}/profile
  getPublicProfile: async (doctorId: number): Promise<DoctorPublic> => {
    const response = await api.get(`/doctors/${doctorId}/profile`);
    return response.data;
  },

  // بروفايلي أنا (الطبيب المسجل دخوله) - GET /doctors/me
  getMyProfile: async (): Promise<DoctorProfile> => {
    const response = await api.get('/doctors/me');
    return response.data;
  },

  // رفع أو تغيير صورتي الشخصية - POST /doctors/me/profile-picture
  uploadProfilePicture: async (file: File): Promise<void> => {
    const form = new FormData();
    form.append('file', file);
    await api.post('/doctors/me/profile-picture', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  // مؤهلاتي مع حالة المراجعة - GET /api/doctors/me/qualifications
  getMyQualifications: async (): Promise<MyQualification[]> => {
    const response = await api.get(`${QUALIFICATIONS}/me/qualifications`);
    return response.data;
  },

  // إضافة مؤهل (يبقى بانتظار مراجعة المشرف) - POST /api/doctors/{doctorProfileId}/qualifications
  addQualification: async (doctorProfileId: number, input: QualificationInput): Promise<MyQualification> => {
    const response = await api.post(`${QUALIFICATIONS}/${doctorProfileId}/qualifications`, input);
    return response.data;
  },

  // حذف مؤهل من مؤهلاتي - DELETE /api/doctors/qualifications/{id}
  deleteQualification: async (qualificationId: number): Promise<void> => {
    await api.delete(`${QUALIFICATIONS}/qualifications/${qualificationId}`);
  },
};
