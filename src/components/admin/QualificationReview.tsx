import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { QualificationReviewItem } from '../../types';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

function errorMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;
}

// يراجع المشرف مؤهلات الأطباء: اعتماد أو رفض بسبب إلزامي، بدون تعديل المحتوى (PO-17، PO-37)
export default function QualificationReview({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [items, setItems] = useState<QualificationReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const apply = (list: QualificationReviewItem[]) => {
    setItems(list);
    onCountChange?.(list.length);
  };

  useEffect(() => {
    let active = true;
    adminApi.getPendingQualifications()
      .then(list => { if (active) apply(list); })
      .catch(err => { if (active) setError(errorMessage(err, 'تعذّر جلب المؤهلات')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !reason.trim()) {
      setError('اكتب سبب الرفض ليراه الطبيب');
      return;
    }
    setBusyId(id);
    setError('');
    try {
      await adminApi.reviewQualification(id, status, status === 'REJECTED' ? reason.trim() : undefined);
      setRejectingId(null);
      setReason('');
      apply(await adminApi.getPendingQualifications());
    } catch (err) {
      setError(errorMessage(err, 'تعذّر حفظ القرار'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-slate-400 text-center py-8">جاري التحميل...</p>;

  return (
    <div className="space-y-3">
      {error && <Alert variant="danger">{error}</Alert>}
      {items.length === 0 ? (
        <p className="text-slate-400 text-center py-8">لا توجد مؤهلات بانتظار المراجعة</p>
      ) : (
        items.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{q.doctorName} · {q.specialty}</p>
                <p className="font-bold text-dark-900">{q.degreeName}</p>
                <p className="text-sm text-slate-600">
                  {q.institution}
                  {q.fieldOfStudy ? ` · ${q.fieldOfStudy}` : ''}
                  {q.yearObtained ? ` · ${q.yearObtained}` : ''}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" loading={busyId === q.id && rejectingId !== q.id} onClick={() => decide(q.id, 'APPROVED')}>
                  <Check size={14} /> اعتماد
                </Button>
                <Button size="sm" variant="outline-danger" onClick={() => { setRejectingId(q.id); setReason(''); setError(''); }}>
                  <X size={14} /> رفض
                </Button>
              </div>
            </div>
            {rejectingId === q.id && (
              <div className="mt-3 space-y-2">
                <label className="block">
                  <span className="block text-sm font-bold text-slate-600 mb-1">سبب الرفض (يظهر للطبيب)</span>
                  <textarea className="input-field" rows={2} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} />
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline-danger" loading={busyId === q.id} onClick={() => decide(q.id, 'REJECTED')}>تأكيد الرفض</Button>
                  <Button size="sm" variant="secondary" onClick={() => setRejectingId(null)}>إلغاء</Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
