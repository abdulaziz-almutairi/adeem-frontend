import { Link } from 'react-router-dom';
import { Video, MessageCircle, CreditCard, XCircle, Loader2 } from 'lucide-react';
import { Appointment } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  PENDING_PAYMENT: 'بانتظار الدفع',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const STATUS_STYLE: Record<Appointment['status'], string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AppointmentCard({
  appointment,
  role,
  onCancel,
  cancelling,
}: {
  appointment: Appointment;
  role: 'PATIENT' | 'DOCTOR';
  onCancel: (id: number) => void;
  cancelling?: boolean;
}) {
  const { unreadByAppointment } = useNotifications();
  const unread = unreadByAppointment[appointment.id] || 0;
  const counterpartName = role === 'PATIENT' ? appointment.doctorName : appointment.patientName;
  const canCancel = appointment.status === 'PENDING_PAYMENT' || appointment.status === 'CONFIRMED';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_STYLE[appointment.status]}`}>
            {STATUS_LABEL[appointment.status]}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
            {appointment.consultationType === 'CALL' ? <Video size={12} /> : <MessageCircle size={12} />}
            {appointment.consultationType === 'CALL' ? 'فيديو' : 'نصي'}
          </span>
        </div>
        <h3 className="font-bold text-dark-900">{counterpartName}</h3>
        <p className="text-sm text-slate-500" dir="ltr">{formatDateTime(appointment.appointmentDate)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {appointment.status === 'PENDING_PAYMENT' && role === 'PATIENT' && (
          <Link
            to={`/payment/${appointment.id}`}
            className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-bold flex items-center gap-2 hover:shadow-md transition-all"
          >
            <CreditCard size={16} /> ادفع الآن
          </Link>
        )}

        {appointment.status === 'CONFIRMED' && appointment.consultationType === 'CHAT' && (
          <Link
            to={`/chat/${appointment.id}`}
            className="relative px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-bold flex items-center gap-2 hover:shadow-md transition-all"
          >
            <MessageCircle size={16} /> فتح المحادثة
            {unread > 0 && (
              <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )}

        {appointment.status === 'CONFIRMED' && appointment.consultationType === 'CALL' && (
          <Link
            to={`/video-call/${appointment.id}`}
            className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-bold flex items-center gap-2 hover:shadow-md transition-all"
          >
            <Video size={16} /> الانضمام للمكالمة
          </Link>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold flex items-center gap-2 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} إلغاء
          </button>
        )}
      </div>
    </div>
  );
}
