import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api, { API_ORIGIN } from './apiService';
import { Message } from '../types';

function getToken(): string | null {
  return localStorage.getItem('adeem_auth_token');
}

// ترويسة المصادقة لإطار STOMP CONNECT
export function stompAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const messageApi = {
  // إرسال رسالة (تُحفظ وتُنشر عبر WebSocket لكل المشتركين بنفس الوقت)
  sendMessage: async (data: { appointmentId: number; content: string; attachmentUrl?: string }): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // جلب سجل المحادثة كامل
  getConversation: async (appointmentId: number): Promise<Message[]> => {
    const response = await api.get(`/messages/${appointmentId}`);
    return response.data;
  },

  // اتصال لحظي عبر WebSocket لاستقبال رسائل موعد معين
  // يرسل التوكن مع إطار CONNECT (FE-01). إذا رفض السيرفر الاتصال يتوقف عن إعادة المحاولة
  connectAppointmentChat: (
    appointmentId: number,
    onMessage: (message: Message) => void,
    onStatusChange?: (connected: boolean) => void,
    onRefused?: () => void,
  ): Client => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_ORIGIN}/ws-chat`),
      reconnectDelay: 5000,
      // يُقرأ التوكن قبل كل محاولة اتصال، حتى تستخدم إعادة الاتصال أحدث توكن
      beforeConnect: (c) => {
        c.connectHeaders = stompAuthHeaders();
      },
      onConnect: () => {
        onStatusChange?.(true);
        client.subscribe(`/topic/appointment/${appointmentId}`, (frame) => {
          try {
            onMessage(JSON.parse(frame.body) as Message);
          } catch {
            console.warn('[messageApi] failed to parse incoming message frame');
          }
        });
      },
      // السيرفر رفض الاتصال أو الاشتراك: لا نعيد المحاولة كل 5 ثواني
      onStompError: () => {
        onStatusChange?.(false);
        onRefused?.();
        void client.deactivate();
      },
      onDisconnect: () => onStatusChange?.(false),
      onWebSocketClose: () => onStatusChange?.(false),
    });

    // بدون توكن لن يقبل السيرفر الاتصال، فلا داعي لفتحه
    if (getToken()) {
      client.activate();
    } else {
      onRefused?.();
    }
    return client;
  },
};
