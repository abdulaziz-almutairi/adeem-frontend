import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Loader2, CheckCircle2, Video, MessageCircle } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { DoctorPublic } from '../../types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

function formatTime(time: string) {
  // "09:00:00" -> "09:00"
  return time.slice(0, 5);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [date, setDate] = useState(todayISO());
  const [consultationType, setConsultationType] = useState<'CALL' | 'CHAT'>('CALL');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorApi.getVerifiedDoctors();
        setDoctors(res);
      } catch (err) {
        console.error('فشل جلب الأطباء:', err);
        setError('تعذّر جلب قائمة الأطباء حالياً. حاول مرة أخرى لاحقاً.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoc === null) return;
    setSelectedSlot(null);
    setSlotsError('');
    setSlotsLoading(true);
    appointmentApi.getAvailableSlots(selectedDoc, date)
      .then(setSlots)
      .catch((err) => {
        setSlots([]);
        setSlotsError(err.response?.data?.message || 'الطبيب غير متاح بهذا اليوم، جرّب تاريخاً آخر');
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDoc, date]);

  const handleBook = async () => {
    if (selectedDoc === null || !selectedSlot) return;
    setBooking(true);
    setBookingError('');
    try {
      await appointmentApi.bookAppointment({
        doctorId: selectedDoc,
        appointmentDate: `${date}T${selectedSlot}`,
        consultationType,
      });
      navigate('/patient/dashboard');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'تعذّر إتمام الحجز، حاول مرة أخرى');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoc) || null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 adeem-bg">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900">حجز استشارة جلدية أونلاين</h1>
          <p className="text-slate-500 mt-2">اختر طبيب الجلدية، ثم الموعد المناسب لك</p>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm">1</span>
            اختر طبيب الجلدية
          </h2>
          {doctors.length === 0 && !error ? (
            <p className="text-slate-400 text-center py-8">لا يوجد أطباء موثقون متاحون حالياً</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDoc === doc.id ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-brand-200'}`}
                >
                  <h3 className="font-bold">{doc.fullName}</h3>
                  <p className="text-sm text-brand-600 font-semibold">{doc.specialty}</p>
                  {doc.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.bio}</p>}
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="font-bold">{doc.pricePerSession} ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDoctor && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 shrink-0 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm">2</span>
              اختر التاريخ ونوع الاستشارة
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">التاريخ</label>
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
                  dir="ltr"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">نوع الاستشارة</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultationType('CALL')}
                    className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${consultationType === 'CALL' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    <Video size={16} /> مكالمة فيديو
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultationType('CHAT')}
                    className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${consultationType === 'CHAT' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    <MessageCircle size={16} /> محادثة نصية
                  </button>
                </div>
              </div>
            </div>

            <label className="block text-sm font-bold text-slate-700 mb-2">الوقت المتاح</label>
            {slotsLoading ? (
              <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-brand-600 animate-spin" /></div>
            ) : slotsError ? (
              <Alert variant="warning">{slotsError}</Alert>
            ) : slots.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد أوقات فاضية بهذا اليوم</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${selectedSlot === slot ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                    dir="ltr"
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDoctor && selectedSlot && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-success-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-success-500" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">تأكيد الحجز</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
              استشارة {consultationType === 'CALL' ? 'فيديو' : 'نصية'} مع {selectedDoctor.fullName} بتاريخ {date} الساعة {formatTime(selectedSlot)}
              بسعر {selectedDoctor.pricePerSession} ر.س
            </p>

            {bookingError && <Alert variant="danger" className="mb-4">{bookingError}</Alert>}

            <Button onClick={handleBook} loading={booking} size="lg">
              {!booking && <CalendarClock size={18} />} {booking ? 'جاري الحجز...' : 'تأكيد الحجز والانتقال للدفع'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
