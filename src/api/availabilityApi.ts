import api from './apiService';
import { Availability, DayOfWeek } from '../types';

export const availabilityApi = {
  // الطبيب يضيف يوم دوام
  addAvailability: async (data: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }) => {
    const response = await api.post('/availability', data);
    return response.data;
  },

  // الطبيب يشوف جدوله هو
  getMyAvailability: async (): Promise<Availability[]> => {
    const response = await api.get('/availability/me');
    return response.data;
  },

  // جدول طبيب معين (عام)
  getDoctorAvailability: async (doctorId: number): Promise<Availability[]> => {
    const response = await api.get(`/availability/doctor/${doctorId}`);
    return response.data;
  },

  // حذف يوم دوام
  deleteAvailability: async (id: number) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },
};
