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

  registerDoctor: async (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    specialty: string;
    licenseNumber: string;
    pricePerSession: number;
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