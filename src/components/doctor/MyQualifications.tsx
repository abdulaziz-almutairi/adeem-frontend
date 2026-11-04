import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import type { MyQualification, QualificationStatus } from '../../types';
import Badge, { type BadgeVariant } from '../ui/Badge';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const STATUS: Record<QualificationStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'بانتظار المراجعة', variant: 'warning' },
  APPROVED: { label: 'معتمد ويظهر للمرضى', variant: 'success' },
  REJECTED: { label: 'مرفوض', variant: 'danger' },
};

function errorMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
}

// يضيف الطبيب مؤهلاته ويحذفها ويرى حالة مراجعتها. لا يظهر للمرضى إلا المعتمد (PO-34)
export default function MyQualifications({ doctorProfileId }: { doctorProfileId: number }) {
  const [items, setItems] = useState<MyQualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [yearObtained, setYearObtained] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setItems(await doctorApi.getMyQualifications());
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'تعذّر جلب المؤهلات'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    doctorApi.getMyQualifications()
      .then(list => { if (active) setItems(list); })
      .catch(err => { if (active) setError(errorMessage(err, 'تعذّر جلب المؤهلات')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!degreeName.trim() || !institution.trim()) {
      setError('اسم الدرجة العلمية والمؤسسة التعليمية مطلوبان');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await doctorApi.addQualification(doctorProfileId, {
        degreeName: degreeName.trim(),
        institution: institution.trim(),
        fieldOfStudy: fieldOfStudy.trim() || undefined,
        yearObtained: yearObtained ? Number(yearObtained) : undefined,
      });
      setDegreeName('');
      setInstitution('');
      setFieldOfStudy('');
      setYearObtained('');
      await load();
    } catch (err) {
      setError(errorMessage(err, 'تعذّر إضافة المؤهل'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل تريد حذف هذا المؤهل؟')) return;
    setDeletingId(id);
    setError('');
    try {
      await doctorApi.deleteQualification(id);
      await load();
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حذف المؤهل'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-dark-900">مؤهلاتي العلمية</h3>
        <p className="text-sm text-slate-500">كل مؤهل جديد يراجعه المشرف قبل ظهوره للمرضى.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-400">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">لم تضف أي مؤهل بعد</p>
      ) : (
        <ul className="space-y-2">
          {items.map(q => (
            <li key={q.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-dark-900">{q.degreeName}</p>
                <p className="text-sm text-slate-600">
                  {q.institution}
                  {q.fieldOfStudy ? ` · ${q.fieldOfStudy}` : ''}
                  {q.yearObtained ? ` · ${q.yearObtained}` : ''}
                </p>
                <Badge variant={STATUS[q.status].variant} className="mt-2">{STATUS[q.status].label}</Badge>
                {q.status === 'REJECTED' && q.rejectionReason && (
                  <p className="text-sm text-danger-600 mt-1">سبب الرفض: {q.rejectionReason}</p>
                )}
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                loading={deletingId === q.id}
                onClick={() => handleDelete(q.id)}
                aria-label={`حذف ${q.degreeName}`}
              >
                <Trash2 size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <label className="block">
          <span className="block text-sm font-bold text-slate-600 mb-1">الدرجة العلمية *</span>
          <input className="input-field" value={degreeName} onChange={e => setDegreeName(e.target.value)} maxLength={150} required />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-slate-600 mb-1">المؤسسة التعليمية *</span>
          <input className="input-field" value={institution} onChange={e => setInstitution(e.target.value)} maxLength={200} required />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-slate-600 mb-1">مجال التخصص</span>
          <input className="input-field" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} maxLength={150} />
        </label>
        <label className="block">
          <span className="block text-sm font-bold text-slate-600 mb-1">سنة الحصول عليه</span>
          <input className="input-field" type="number" min={1950} max={new Date().getFullYear()} value={yearObtained}
                 onChange={e => setYearObtained(e.target.value)} dir="ltr" />
        </label>
        <div className="md:col-span-2">
          <Button type="submit" loading={saving}><Plus size={16} /> إضافة مؤهل</Button>
        </div>
      </form>
    </div>
  );
}
