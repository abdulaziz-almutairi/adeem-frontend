import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Loader2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function VideoCallPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    const fetchAppointment = async () => {
      try {
        const list = user.role === 'DOCTOR'
          ? await appointmentApi.getMyAppointmentsAsDoctor()
          : await appointmentApi.getMyAppointmentsAsPatient();

        const found = list.find(a => a.id === Number(id));
        if (!found) {
          setError('هذا الموعد غير موجود أو لا يخصك');
        } else {
          setAppointment(found);
        }
      } catch (err) {
        console.error('فشل جلب بيانات الموعد:', err);
        setError('تعذّر جلب بيانات الموعد');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, user]);

  if (loading) {
    return (
      <div className="h-screen bg-dark-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">جاري تحضير المكالمة...</p>
      </div>
    );
  }

  const counterpartName = appointment ? (user?.role === 'DOCTOR' ? appointment.patientName : appointment.doctorName) : '';

  return (
    <div className="h-screen bg-dark-900 flex flex-col items-center justify-center text-white px-6">
      <button onClick={() => navigate(-1)} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 text-sm text-slate-300">
        <ArrowRight size={18} /> رجوع
      </button>

      {error ? (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">تعذّر فتح المكالمة</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : appointment && appointment.status !== 'CONFIRMED' ? (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="text-amber-400" size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">الموعد غير مؤكد بعد</h2>
          <p className="text-slate-400 text-sm">رابط المكالمة يظهر بعد تأكيد الدفع مباشرة</p>
        </div>
      ) : appointment && !appointment.meetingLink ? (
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="text-amber-400" size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">رابط المكالمة غير جاهز بعد</h2>
          <p className="text-slate-400 text-sm">حاول تحديث الصفحة بعد قليل</p>
        </div>
      ) : appointment ? (
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-brand-600/20 flex items-center justify-center mb-4">
            <Video className="text-brand-400" size={36} />
          </div>
          <h2 className="text-xl font-bold mb-1">استشارة فيديو مع {counterpartName}</h2>
          <p className="text-slate-400 text-sm mb-6" dir="ltr">{formatDateTime(appointment.appointmentDate)}</p>
          <a
            href={appointment.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-gradient text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <ExternalLink size={18} /> الانضمام لمكالمة Zoom
          </a>
          <p className="text-slate-500 text-xs mt-4">ستُفتح المكالمة في نافذة أو تطبيق Zoom منفصل</p>
        </div>
      ) : null}
    </div>
  );
}
