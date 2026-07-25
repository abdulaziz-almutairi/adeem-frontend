import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Send, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { messageApi } from '../../api/messageApi';
import { appointmentApi } from '../../api/appointmentApi';
import { useAuth } from '../../context/AuthContext';
import { Appointment, Message } from '../../types';
import type { Client } from '@stomp/stompjs';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (isSameDay(date, today)) return 'اليوم';
  if (isSameDay(date, yesterday)) return 'أمس';
  return date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' });
}

function initial(name?: string) {
  return name?.trim()?.charAt(0) || '؟';
}

export default function AppointmentChatPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!appointmentId || !user) return;
    const id = Number(appointmentId);

    messageApi.getConversation(id)
      .then(setMessages)
      .catch((err) => setError(err.response?.data?.message || 'تعذّر جلب المحادثة'))
      .finally(() => setLoading(false));

    const appointmentsPromise = user.role === 'DOCTOR'
      ? appointmentApi.getMyAppointmentsAsDoctor()
      : appointmentApi.getMyAppointmentsAsPatient();
    appointmentsPromise
      .then((list) => setAppointment(list.find(a => a.id === id) || null))
      .catch(() => {});

    const client = messageApi.connectAppointmentChat(
      id,
      (incoming) => setMessages(prev => (prev.some(m => m.id === incoming.id) ? prev : [...prev, incoming])),
      setConnected,
    );
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [appointmentId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !appointmentId || sending) return;

    setSending(true);
    setError('');
    try {
      await messageApi.sendMessage({ appointmentId: Number(appointmentId), content });
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذّر إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const counterpartName = appointment
    ? (user?.role === 'DOCTOR' ? appointment.patientName : appointment.doctorName)
    : 'محادثة الاستشارة';

  let lastDayLabel = '';

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center gap-3 bg-brand-gradient text-white rounded-t-2xl">
            <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowRight size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">
              {initial(counterpartName)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold truncate">{counterpartName}</h3>
              <span className="text-xs text-white/80 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-300' : 'bg-white/40'}`} />
                {connected ? 'متصل الآن' : 'جاري الاتصال...'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50/50">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-brand-600 animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <MessageCircle size={32} />
                <p className="text-sm">لا توجد رسائل بعد، ابدأ المحادثة</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderId === user?.id;
                const dayLabel = formatDayLabel(m.sentAt);
                const showDaySeparator = dayLabel !== lastDayLabel;
                lastDayLabel = dayLabel;
                const prevSameSender = idx > 0 && messages[idx - 1].senderId === m.senderId && !showDaySeparator;

                return (
                  <div key={m.id}>
                    {showDaySeparator && (
                      <div className="flex justify-center my-3">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-200/70 px-3 py-1 rounded-full">{dayLabel}</span>
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${prevSameSender ? 'mt-0.5' : 'mt-3'}`}>
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 ${prevSameSender ? 'invisible' : ''}`}>
                          {initial(m.senderName)}
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? `bg-brand-gradient text-white rounded-2xl ${prevSameSender ? 'rounded-tl-2xl' : 'rounded-tl-2xl'} rounded-br-md`
                            : `bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-md`
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-[10px] mt-1 text-left ${isMe ? 'text-white/70' : 'text-slate-400'}`} dir="ltr">
                          {formatTime(m.sentAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="input-field flex-1 min-w-0 px-4 py-3 rounded-full border-2 border-slate-200 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-12 h-12 rounded-full bg-brand-gradient text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-md hover:shadow-lg flex-shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
