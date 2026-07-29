import { Link } from 'react-router-dom';
import { Video, MessageCircle, CreditCard, XCircle, Loader2 } from 'lucide-react';
import { Appointment } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { buttonClasses } from '../ui/buttonStyles';
import Badge, { type BadgeVariant } from '../ui/Badge';

const STATUS_LABEL: Record<Appointment['status'], string> = {
  PENDING_PAYMENT: 'بانتظار الدفع',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const STATUS_VARIANT: Record<Appointment['status'], BadgeVariant> = {
  PENDING_PAYMENT: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
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
          <Badge variant={STATUS_VARIANT[appointment.status]}>{STATUS_LABEL[appointment.status]}</Badge>
          <Badge variant="neutral">
            {appointment.consultationType === 'CALL' ? <Video size={12} /> : <MessageCircle size={12} />}
            {appointment.consultationType === 'CALL' ? 'فيديو' : 'نصي'}
          </Badge>
        </div>
        <h3 className="font-bold text-dark-900">{counterpartName}</h3>
        <p className="text-sm text-slate-500" dir="ltr">{formatDateTime(appointment.appointmentDate)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {appointment.status === 'PENDING_PAYMENT' && role === 'PATIENT' && (
          <Link to={`/payment/${appointment.id}`} className={buttonClasses('primary', 'sm')}>
            <CreditCard size={16} /> ادفع الآن
          </Link>
        )}

        {appointment.status === 'CONFIRMED' && appointment.consultationType === 'CHAT' && (
          <Link to={`/chat/${appointment.id}`} className={buttonClasses('primary', 'sm', 'relative')}>
            <MessageCircle size={16} /> فتح المحادثة
            {unread > 0 && (
              <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )}

        {appointment.status === 'CONFIRMED' && appointment.consultationType === 'CALL' && (
          <Link to={`/video-call/${appointment.id}`} className={buttonClasses('primary', 'sm')}>
            <Video size={16} /> الانضمام للمكالمة
          </Link>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(appointment.id)}
            disabled={cancelling}
            className={buttonClasses('outline-danger', 'sm')}
          >
            {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} إلغاء
          </button>
        )}
      </div>
    </div>
  );
}
