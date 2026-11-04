import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { appointmentApi } from '../api/appointmentApi';
import { messageApi } from '../api/messageApi';
import { Message } from '../types';
import type { Client } from '@stomp/stompjs';

export interface ChatToast {
  id: string;
  appointmentId: number;
  senderName: string;
  content: string;
}

interface NotificationContextType {
  unreadByAppointment: Record<number, number>;
  totalUnread: number;
  toasts: ChatToast[];
  dismissToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadByAppointment, setUnreadByAppointment] = useState<Record<number, number>>({});
  const [toasts, setToasts] = useState<ChatToast[]>([]);
  const clientsRef = useRef<Client[]>([]);
  const activeAppointmentIdRef = useRef<number | null>(null);

  // نمط React الموصى به لضبط الحالة عند تغيّر قيمة: أثناء العرض بدل داخل effect
  const pathMatch = location.pathname.match(/^\/chat\/(\d+)/);
  const activeChatId = pathMatch ? Number(pathMatch[1]) : null;
  const userId = user?.id ?? null;
  const [seenChatId, setSeenChatId] = useState<number | null>(null);
  const [seenUserId, setSeenUserId] = useState<number | null>(userId);
  if (userId !== seenUserId) {
    // مستخدم آخر: نبدأ عدّاد الرسائل من الصفر
    setSeenUserId(userId);
    setUnreadByAppointment({});
  }
  if (activeChatId !== seenChatId) {
    // فتح محادثة يصفّر عدّاد رسائلها غير المقروءة
    setSeenChatId(activeChatId);
    if (activeChatId !== null) {
      setUnreadByAppointment(prev => (prev[activeChatId] ? { ...prev, [activeChatId]: 0 } : prev));
    }
  }

  // تتبع أي محادثة مفتوحة حالياً عشان ما نزعج المستخدم برسالة هو أصلاً شايفها
  useEffect(() => {
    activeAppointmentIdRef.current = activeChatId;
  }, [activeChatId]);

  // إذن الإشعارات على مستوى المتصفح (اختياري - لو رفض المستخدم نكتفي بالتنبيه داخل الصفحة)
  useEffect(() => {
    if (!user) return;
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [user]);

  // اتصال WebSocket بكل محادثات المستخدم النشطة (CONFIRMED + CHAT) عشان نستقبل الرسائل الجديدة أينما كان بالتطبيق
  useEffect(() => {
    clientsRef.current.forEach(c => c.deactivate());
    clientsRef.current = [];

    if (!user) return;

    let cancelled = false;

    const setup = async () => {
      try {
        const list = user.role === 'DOCTOR'
          ? await appointmentApi.getMyAppointmentsAsDoctor()
          : await appointmentApi.getMyAppointmentsAsPatient();

        if (cancelled) return;

        const chatAppointments = list.filter(a => a.status === 'CONFIRMED' && a.consultationType === 'CHAT');

        clientsRef.current = chatAppointments.map(appt =>
          messageApi.connectAppointmentChat(appt.id, (message: Message) => {
            if (message.senderId === user.id) return; // رسالتي أنا، تجاهل
            if (activeAppointmentIdRef.current === appt.id) return; // المحادثة مفتوحة حالياً

            setUnreadByAppointment(prev => ({ ...prev, [appt.id]: (prev[appt.id] || 0) + 1 }));

            const toastId = `${appt.id}-${message.id}-${Date.now()}`;
            setToasts(prev => [...prev, { id: toastId, appointmentId: appt.id, senderName: message.senderName, content: message.content }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 6000);

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
              new Notification(`رسالة جديدة من ${message.senderName}`, { body: message.content });
            }
          }),
        );
      } catch (err) {
        console.error('[NotificationProvider] فشل الاشتراك بمحادثات المستخدم', err);
      }
    };

    setup();

    return () => {
      cancelled = true;
      clientsRef.current.forEach(c => c.deactivate());
      clientsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const totalUnread = Object.values(unreadByAppointment).reduce((sum, n) => sum + n, 0);

  return (
    <NotificationContext.Provider value={{ unreadByAppointment, totalUnread, toasts, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
