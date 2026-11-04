import { useId, useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import type { QualificationPublic } from '../../types';

// المؤهلات المعتمدة مخفية افتراضياً، ويعرضها المريض بنفسه عند الضغط
export default function QualificationsToggle({ qualifications }: { qualifications: QualificationPublic[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (qualifications.length === 0) {
    return <p className="text-sm text-slate-400">لا توجد مؤهلات معتمدة معروضة بعد</p>;
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-brand-200 font-bold text-dark-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          <GraduationCap size={18} className="text-brand-600" />
          {open ? 'إخفاء المؤهلات' : `عرض المؤهلات (${qualifications.length})`}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={panelId} className="mt-3 space-y-2">
          {qualifications.map(q => (
            <li key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-dark-900">{q.degreeName}</p>
              <p className="text-sm text-slate-600">
                {q.institution}
                {q.fieldOfStudy ? ` · ${q.fieldOfStudy}` : ''}
                {q.yearObtained ? ` · ${q.yearObtained}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
