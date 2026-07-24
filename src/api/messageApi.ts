import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api, { API_ORIGIN } from './apiService';
import { Message } from '../types';

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
  connectAppointmentChat: (
    appointmentId: number,
    onMessage: (message: Message) => void,
    onStatusChange?: (connected: boolean) => void,
  ): Client => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_ORIGIN}/ws-chat`),
      reconnectDelay: 5000,
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
      onDisconnect: () => onStatusChange?.(false),
      onWebSocketClose: () => onStatusChange?.(false),
    });

    client.activate();
    return client;
  },
};
