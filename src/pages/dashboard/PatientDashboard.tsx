import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, CalendarCheck, Bot, Loader2, CalendarX, Pencil } from 'lucide-react';
import { appointmentApi } from '../../api/appointmentApi';
import { Appointment } from '../../types';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentApi.getMyAppointmentsAsPatient();
      setAppointments(res.slice().sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate)));
    } catch (err) {
      console.error('فشل جلب المواعيد:', err);
      setError('تعذّر جلب مواعيدك حالياً');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;
    setCancellingId(id);
    try {
      await appointmentApi.cancelAppointment(id);
      await fetchAppointments();
    } catch (err) {
      console.error('فشل إلغاء الموعد:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-900">مرحباً، {user?.fullName}</h1>
            <p className="text-slate-500">لوحة تحكم المريض - منصة أديم</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditingProfile(true)}>
              <Pencil size={16} /> تعديل البيانات
            </Button>
            <Button variant="outline-danger" onClick={handleLogout}>
              <LogOut size={18} /> تسجيل الخروج
            </Button>
          </div>
        </div>

        {editingProfile && <EditProfileModal onClose={() => setEditingProfile(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/booking"
            className="bg-brand-600 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4 hover:bg-brand-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <CalendarCheck size={28} />
            <div>
              <h3 className="font-bold">حجز استشارة</h3>
              <p className="text-white/80 text-sm">تصفح أطباء الجلدية الموثقين</p>
            </div>
          </Link>
          <Link
            to="/ai-chat"
            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-100 transition-all"
          >
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600"><Bot size={22} /></div>
            <div>
              <h3 className="font-bold">المساعد الذكي</h3>
              <p className="text-slate-500 text-sm">استشر حول أعراضك الجلدية</p>
            </div>
          </Link>
        </div>

        <h2 className="text-xl font-bold text-dark-900 mb-4">مواعيدي</h2>

        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <CalendarX className="text-slate-400" size={28} />
            </div>
            <h3 className="font-bold mb-1">لا توجد مواعيد بعد</h3>
            <p className="text-slate-500 text-sm">احجز استشارتك الأولى الآن</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(a => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                role="PATIENT"
                onCancel={handleCancel}
                cancelling={cancellingId === a.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
