import { useState } from 'react';
import { X, User as UserIcon, Phone, CheckCircle2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const PHONE_PATTERN = /^05[0-9]{8}$/;

interface EditProfileModalProps {
  onClose: () => void;
  onSaved?: (patch: { fullName: string; phoneNumber?: string }) => void;
}

export default function EditProfileModal({ onClose, onSaved }: EditProfileModalProps) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = fullName.trim();
    if (trimmedName.length === 0) {
      setError('الاسم الكامل مطلوب');
      return;
    }
    if (phoneNumber && !PHONE_PATTERN.test(phoneNumber)) {
      setError('رقم الهاتف غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');
      return;
    }

    setSaving(true);
    try {
      await authApi.updateProfile({ fullName: trimmedName, phoneNumber: phoneNumber || undefined });
      updateUser({ fullName: trimmedName, phoneNumber: phoneNumber || undefined });
      onSaved?.({ fullName: trimmedName, phoneNumber: phoneNumber || undefined });
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذّر حفظ التعديلات، حاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-dark-900">تعديل البيانات الشخصية</h2>
            <p className="text-sm text-slate-500 mt-0.5">حدّث اسمك ورقم هاتفك</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-success-100 text-success-600 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <p className="font-bold text-dark-900">تم حفظ التعديلات بنجاح</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
              <div className="relative">
                <UserIcon size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field w-full ps-11 pe-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone size={18} className="absolute top-1/2 -translate-y-1/2 start-4 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="input-field w-full ps-11 pe-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
                  dir="ltr"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1.5">لا يمكن تغيير البريد الإلكتروني حالياً</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                إلغاء
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                حفظ التعديلات
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
