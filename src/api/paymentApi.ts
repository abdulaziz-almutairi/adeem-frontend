import api from './apiService';
import { Payment } from '../types';

export const paymentApi = {
  // بدء عملية الدفع (مريض) - ينشئ سجل الدفع ويرجع مبلغ ومرجع
  initiatePayment: async (appointmentId: number): Promise<Payment> => {
    const response = await api.post('/payments/initiate', { appointmentId });
    return response.data;
  },

  // تأكيد الدفع (وضع تجريبي - بانتظار بوابة الدفع الحقيقية)
  confirmPayment: async (transactionReference: string) => {
    const response = await api.post('/payments/confirm', { transactionReference });
    return response.data;
  },
};
