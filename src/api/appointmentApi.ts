import api from './apiService';
import { Appointment } from '../types';

export const appointmentApi = {
  // الـ slots الفاضية ليوم معين عند طبيب معين (عام)
  getAvailableSlots: async (doctorId: number, date: string): Promise<string[]> => {
    const response = await api.get('/appointments/available-slots', { params: { doctorId, date } });
    return response.data;
  },

  // حجز موعد (مريض فقط)
  bookAppointment: async (data: {
    doctorId: number;
    appointmentDate: string;
    consultationType: 'CALL' | 'CHAT';
  }) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // مواعيدي (مريض)
  getMyAppointmentsAsPatient: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  // مواعيدي (طبيب)
  getMyAppointmentsAsDoctor: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/doctor-appointments');
    return response.data;
  },

  // إلغاء موعد
  cancelAppointment: async (id: number) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },
};
