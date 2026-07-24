import api from './apiService';
import { ChatbotMessage } from '../types';

export const chatApi = {
  // اسأل المساعد الذكي (يبدأ محادثة جديدة لو conversationId فاضي)
  ask: async (data: { content: string; conversationId?: number | null }): Promise<ChatbotMessage> => {
    const response = await api.post('/chatbot/ask', data);
    return response.data;
  },

  // اسأل المساعد الذكي مع إرفاق صورة (تحليل صورة حالة جلدية أو نتيجة تحليل)
  askWithImage: async (data: { image: File; content?: string; conversationId?: number | null }): Promise<ChatbotMessage> => {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.content) formData.append('content', data.content);
    if (data.conversationId) formData.append('conversationId', String(data.conversationId));

    const response = await api.post('/chatbot/ask-with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // جلب سجل محادثة سابقة
  getHistory: async (conversationId: number): Promise<ChatbotMessage[]> => {
    const response = await api.get(`/chatbot/${conversationId}`);
    return response.data;
  },
};
