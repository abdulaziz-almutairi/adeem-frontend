import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { RANK_LABELS } from '../utils/doctorRank';
import type { DoctorRank } from '../types';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'PATIENT',
    specialty: '',
    licenseNumber: '',
    // للطبيب: الاسم بثلاثة أجزاء، والرتبة المطلوبة وسنوات الخبرة (يراجعها المشرف عند التوثيق). السعر يُحسب من الرتبة
    firstName: '',
    secondName: '',
    lastName: '',
    rank: '' as DoctorRank | '',
    experiance: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerPatient, registerDoctor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (form.role === 'DOCTOR') {
        if (!form.firstName.trim() || !form.secondName.trim() || !form.lastName.trim()
            || !form.specialty || !form.licenseNumber || !form.rank || form.experiance === '') {
          setError('يجب إدخال الاسم الثلاثي والتخصص والمسمى المهني وسنوات الخبرة ورقم الترخيص');
          setLoading(false);
          return;
        }

        await registerDoctor({
          firstName: form.firstName.trim(),
          secondName: form.secondName.trim(),
          lastName: form.lastName.trim(),
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || undefined,
          specialty: form.specialty,
          rank: form.rank,
          experiance: Number(form.experiance),
          licenseNumber: form.licenseNumber,
        });

        setSuccess('تم تقديم طلب التسجيل بنجاح! حسابك بانتظار التوثيق من الإدارة.');
      } else {
        await registerPatient({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || undefined,
        });

        setSuccess('تم إنشاء حسابك بنجاح! يمكنك تسجيل الدخول الآن.');
      }

      setTimeout(() => navigate('/login'), 3000);

    } catch (err: any) {
      console.error('[Register Error]', err);
      let errorMessage = 'حدث خطأ في التسجيل';

      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'خطأ في الاتصال بالخادم ';
      } else if (err.response) {
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.map((e: any) => e.message || e.defaultMessage).join('، ');
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center adeem-bg px-4 py-6 sm:py-12">
      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-dark-900">إنشاء حساب جديد</h2>
          <p className="text-slate-500 text-sm mt-1">انضم لمنصة أديم الطبية</p>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {success && (
          <Alert variant="success" className="mb-4">
            <p>{success}</p>
            <p className="mt-1 text-xs">جاري التحويل لصفحة تسجيل الدخول...</p>
          </Alert>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نوع الحساب */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" name="role" value="PATIENT" checked={form.role === 'PATIENT'} onChange={handleChange} className="hidden peer" />
                  <div className="h-full p-3 rounded-xl border-2 border-slate-200 text-center transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 flex flex-col items-center justify-center">
                    <i className="fas fa-user text-lg text-slate-400 peer-checked:text-brand-600 mb-1 block"></i>
                    <span className="text-sm font-bold">مريض</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="role" value="DOCTOR" checked={form.role === 'DOCTOR'} onChange={handleChange} className="hidden peer" />
                  <div className="h-full p-3 rounded-xl border-2 border-slate-200 text-center transition-all peer-checked:border-brand-500 peer-checked:bg-brand-50 flex flex-col items-center justify-center">
                    <i className="fas fa-user-md text-lg text-slate-400 peer-checked:text-brand-600 mb-1 block"></i>
                    <span className="text-sm font-bold">طبيب جلدية</span>
                  </div>
                </label>
              </div>
            </div>

            {form.role === 'DOCTOR' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">الاسم الأول</label>
                  <input id="firstName" type="text" name="firstName" value={form.firstName} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required />
                </div>
                <div>
                  <label htmlFor="secondName" className="block text-sm font-bold text-slate-700 mb-2">اسم الأب</label>
                  <input id="secondName" type="text" name="secondName" value={form.secondName} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">اسم العائلة</label>
                  <input id="lastName" type="text" name="lastName" value={form.lastName} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <input id="fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رقم الجوال</label>
              <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="05XXXXXXXX" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="8 أحرف على الأقل" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required />
            </div>

            {/* حقول إضافية للطبيب */}
            {form.role === 'DOCTOR' && (
              <div className="space-y-4 p-4 rounded-xl bg-brand-50 border border-brand-100">
                <h3 className="font-bold text-brand-700 text-sm">بيانات الترخيص الطبي</h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">التخصص</label>
                  <input type="text" name="specialty" value={form.specialty} onChange={handleChange} placeholder="أمراض جلدية وتجميل" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الترخيص</label>
                  <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="MOH-XXXXX" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required />
                </div>
                <div>
                  <label htmlFor="rank" className="block text-sm font-bold text-slate-700 mb-2">المسمى المهني</label>
                  <select id="rank" name="rank" value={form.rank} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" required>
                    <option value="" disabled>اختر المسمى المهني</option>
                    {(Object.keys(RANK_LABELS) as DoctorRank[]).map(r => (
                      <option key={r} value={r}>{RANK_LABELS[r]}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">يراجعه المشرف عند توثيق حسابك، وسعر الجلسة يُحدد حسب المسمى المعتمد.</p>
                </div>
                <div>
                  <label htmlFor="experiance" className="block text-sm font-bold text-slate-700 mb-2">سنوات الخبرة</label>
                  <input id="experiance" type="number" name="experiance" value={form.experiance} onChange={handleChange} placeholder="0" className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm" dir="ltr" required min="0" max="60" step="1" />
                </div>
              </div>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {!loading && <UserPlus size={18} />} {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700">سجل دخولك</Link>
        </p>
      </div>
    </div>
  );
}