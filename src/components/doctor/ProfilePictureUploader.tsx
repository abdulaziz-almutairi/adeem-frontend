import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import DoctorAvatar from './DoctorAvatar';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

// يرفع الطبيب صورته أو يغيّرها؛ السيرفر يربط الصورة بالطبيب المسجّل دخوله فقط
export default function ProfilePictureUploader({
  name,
  url,
  onUploaded,
}: {
  name: string;
  url?: string | null;
  onUploaded: () => void | Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFile = async (file: File | undefined) => {
    setError('');
    setSuccess('');
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('حجم الصورة يجب ألا يتجاوز 5MB');
      return;
    }
    setUploading(true);
    try {
      await doctorApi.uploadProfilePicture(file);
      await onUploaded();
      setSuccess('تم تحديث الصورة الشخصية');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'تعذّر رفع الصورة، حاول لاحقاً');
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <DoctorAvatar name={name} url={url} size="lg" />
      <div className="flex-1 w-full space-y-2 text-center sm:text-start">
        <p className="font-bold text-dark-900">الصورة الشخصية</p>
        <p className="text-sm text-slate-500">تظهر للمرضى في ملفك العام. JPG أو PNG أو WEBP، حتى 5MB.</p>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          aria-label="اختيار صورة شخصية"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <Button variant="secondary" size="sm" loading={uploading} onClick={() => input.current?.click()}>
          <Camera size={16} /> {url ? 'تغيير الصورة' : 'رفع صورة'}
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
      </div>
    </div>
  );
}
