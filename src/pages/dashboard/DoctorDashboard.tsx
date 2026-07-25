import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, AlertCircle, CalendarX, Plus, Trash2, CalendarDays } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { availabilityApi } from '../../api/availabilityApi';
import { Appointment, Availability, DayOfWeek, DoctorProfile } from '../../types';
import AppointmentCard from '../../components/appointments/AppointmentCard';

type StatusFilter = 'ALL' | Appointment['status'];

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: 'الكل',
  PENDING_PAYMENT: 'بانتظار الدفع',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  SUNDAY: 'الأحد',
  MONDAY: 'الإثنين',
  TUESDAY: 'الثلاثاء',
  WEDNESDAY: 'الأربعاء',
  THURSDAY: 'الخميس',
  FRIDAY: 'الجمعة',
  SATURDAY: 'السبت',
};

const DAYS: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'profile'>('appointments');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [newDay, setNewDay] = useState<DayOfWeek>('SUNDAY');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [addingAvailability, setAddingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await doctorApi.getMyProfile();
        setProfile(profileRes);
      } catch (error) {
        console.error('فشل جلب البروفايل:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentApi.getMyAppointmentsAsDoctor();
      setAppointments(res.slice().sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate)));
    } catch (err) {
      console.error('فشل جلب المواعيد:', err);
      setAppointmentsError('تعذّر جلب المواعيد حالياً');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const res = await availabilityApi.getMyAvailability();
      setAvailability(res);
    } catch (err) {
      console.error('فشل جلب جدول الدوام:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); fetchAvailability(); }, []);

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

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvailabilityError('');
    setAddingAvailability(true);
    try {
      await availabilityApi.addAvailability({ dayOfWeek: newDay, startTime: newStart, endTime: newEnd });
      await fetchAvailability();
    } catch (err: any) {
      setAvailabilityError(err.response?.data?.message || 'تعذّر إضافة يوم الدوام');
    } finally {
      setAddingAvailability(false);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      await availabilityApi.deleteAvailability(id);
      await fetchAvailability();
    } catch (err) {
      console.error('فشل حذف يوم الدوام:', err);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter(a => a.status !== 'CANCELLED' && new Date(a.appointmentDate).toDateString() === today);
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'ALL') return appointments;
    return appointments.filter(a => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { ALL: appointments.length, PENDING_PAYMENT: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointments.forEach(a => { counts[a.status]++; });
    return counts;
  }, [appointments]);

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-900">مرحباً، {user?.fullName || profile?.fullName}</h1>
            <p className="text-slate-500">لوحة تحكم الطبيب - منصة أديم</p>
            {profile && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${profile.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : profile.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {profile.verificationStatus === 'VERIFIED' ? '✓ موثق' : profile.verificationStatus === 'PENDING' ? '⏳ بانتظار التوثيق' : '✗ مرفوض'}
                </span>
                <span className="text-xs text-slate-400">{profile.specialty}</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50"><LogOut size={18} /> تسجيل الخروج</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto whitespace-nowrap pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <button onClick={() => setActiveTab('appointments')} className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'appointments' ? 'bg-brand-gradient text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            المواعيد
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'schedule' ? 'bg-brand-gradient text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            جدول العمل
          </button>
          <button onClick={() => setActiveTab('profile')} className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-brand-gradient text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
            الملف التعريفي
          </button>
        </div>

        {/* Appointments */}
        {activeTab === 'appointments' && (
          appointmentsLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : appointmentsError ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-2">
              <AlertCircle size={18} /> {appointmentsError}
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <CalendarX className="text-slate-400" size={28} />
              </div>
              <h3 className="font-bold mb-1">لا توجد مواعيد بعد</h3>
              <p className="text-slate-500 text-sm">ستظهر هنا مواعيد المرضى فور حجزها</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* مواعيد اليوم */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600"><CalendarDays size={18} /></div>
                  <h2 className="text-lg font-bold text-dark-900">مواعيد اليوم</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-brand-100 text-brand-700">{todayAppointments.length}</span>
                </div>
                {todayAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-sm">
                    لا توجد جلسات مجدولة اليوم
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map(a => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        role="DOCTOR"
                        onCancel={handleCancel}
                        cancelling={cancellingId === a.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* كل المواعيد + فلترة بالحالة */}
              <div>
                <h2 className="text-lg font-bold text-dark-900 mb-3">كل المواعيد</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {STATUS_FILTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${statusFilter === s ? 'bg-brand-gradient text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-200'}`}
                    >
                      {STATUS_FILTER_LABELS[s]}
                      <span className={`text-xs ${statusFilter === s ? 'text-white/80' : 'text-slate-400'}`}>({statusCounts[s]})</span>
                    </button>
                  ))}
                </div>

                {filteredAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center text-slate-400 text-sm">
                    لا توجد مواعيد بهذه الحالة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map(a => (
                      <AppointmentCard
                        key={a.id}
                        appointment={a}
                        role="DOCTOR"
                        onCancel={handleCancel}
                        cancelling={cancellingId === a.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">إضافة يوم عمل</h2>
              <form onSubmit={handleAddAvailability} className="flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">اليوم</label>
                  <select value={newDay} onChange={(e) => setNewDay(e.target.value as DayOfWeek)} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">من</label>
                  <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">إلى</label>
                  <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required />
                </div>
                <button type="submit" disabled={addingAvailability} className="px-5 py-3 bg-brand-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                  {addingAvailability ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} إضافة
                </button>
              </form>
              {availabilityError && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{availabilityError}</p>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">أيام العمل الحالية</h2>
              {availabilityLoading ? (
                <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-brand-600 animate-spin" /></div>
              ) : availability.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">لم تُضِف أي يوم عمل بعد</p>
              ) : (
                <div className="space-y-2">
                  {availability.map(a => (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-slate-100">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-bold text-sm">{DAY_LABELS[a.dayOfWeek]}</span>
                        <span className="text-sm text-slate-500" dir="ltr">{a.startTime.slice(0, 5)} - {a.endTime.slice(0, 5)}</span>
                      </div>
                      <button onClick={() => handleDeleteAvailability(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && profile && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">بياناتي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-slate-500 mb-1">الاسم</label><p className="font-semibold">{profile.fullName}</p></div>
              <div><label className="block text-sm font-bold text-slate-500 mb-1">البريد</label><p className="font-semibold" dir="ltr">{profile.email}</p></div>
              <div><label className="block text-sm font-bold text-slate-500 mb-1">التخصص</label><p className="font-semibold">{profile.specialty}</p></div>
              <div><label className="block text-sm font-bold text-slate-500 mb-1">سعر الجلسة</label><p className="font-semibold">{profile.pricePerSession} ر.س</p></div>
              <div><label className="block text-sm font-bold text-slate-500 mb-1">حالة التوثيق</label>
                <span className={`text-sm px-3 py-1 rounded-full font-bold ${profile.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : profile.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {profile.verificationStatus === 'VERIFIED' ? 'موثق' : profile.verificationStatus === 'PENDING' ? 'بانتظار التوثيق' : 'مرفوض'}
                </span>
              </div>
            </div>
            {profile.bio && <div className="mt-4"><label className="block text-sm font-bold text-slate-500 mb-1">نبذة</label><p className="text-slate-700">{profile.bio}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
