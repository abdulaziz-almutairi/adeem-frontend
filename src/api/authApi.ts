import type { DoctorRank } from '../types';
import api from './apiService';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  registerPatient: async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => {
    const response = await api.post('/users/register', data);
    return response.data;
  },

  // يطابق DoctorRegisterDTO في الخادم (QA-004): الاسم بثلاثة أجزاء، والرتبة والخبرة إلزامية، والسعر يُحسب من الرتبة
  registerDoctor: async (data: {
    firstName: string;
    secondName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    specialty: string;
    rank: DoctorRank;
    experiance: number;
    licenseNumber: string;
    bio?: string;
  }) => {
    const response = await api.post('/doctors/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; phoneNumber?: string }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getDoctorMe: async () => {
    const response = await api.get('/doctors/me');
    return response.data;
  },

  logout: async () => {
    //
},
};