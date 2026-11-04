import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CalendarClock, Loader2, Stethoscope } from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import type { DoctorPublic } from '../../types';
import DoctorAvatar from '../../components/doctor/DoctorAvatar';
import QualificationsToggle from '../../components/doctor/QualificationsToggle';
import Alert from '../../components/ui/Alert';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { experienceLabel, rankLabel } from '../../utils/doctorRank';

// ملف الطبيب كما يراه المريض: الصورة، الاسم، المسمى المهني، الخبرة، والمؤهلات المعتمدة عند الطلب
export default function DoctorProfilePage() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState<DoctorPublic | null>(null);
  const [loadError, setLoadError] = useState('');
  const id = Number(doctorId);
  const validId = Number.isInteger(id) && id > 0;
  const error = validId ? loadError : 'الطبيب غير موجود';

  useEffect(() => {
    if (!validId) return;
    let active = true;
    doctorApi.getPublicProfile(id)
      .then(d => { if (active) setDoctor(d); })
      .catch(err => { if (active) setLoadError(err.response?.data?.message || 'تعذّر جلب ملف الطبيب'); });
    return () => { active = false; };
  }, [id, validId]);

  const title = doctor ? [rankLabel(doctor.rank), doctor.specialty].filter(Boolean).join(' · ') : '';
  const experience = doctor ? experienceLabel(doctor.yearsOfExperience) : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-6 pb-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/booking" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 mb-4">
          <ArrowRight size={16} /> العودة لقائمة الأطباء
        </Link>

        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !doctor ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : (
          <article className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
            <header className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100">
              <DoctorAvatar name={doctor.fullName} url={doctor.profilePictureUrl} size="lg" />
              <div className="text-center sm:text-start min-w-0">
                <h1 className="text-2xl font-bold text-dark-900 flex items-center justify-center sm:justify-start gap-2">
                  {doctor.fullName}
                  <BadgeCheck size={20} className="text-brand-600 shrink-0" aria-label="طبيب موثق" />
                </h1>
                {title && (
                  <p className="text-brand-600 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <Stethoscope size={16} /> {title}
                  </p>
                )}
                {experience && <p className="text-slate-600 mt-1">{experience}</p>}
                <p className="mt-2 font-bold text-dark-900">{doctor.pricePerSession} ر.س <span className="text-sm font-normal text-slate-500">للجلسة</span></p>
              </div>
            </header>

            <div className="p-6 space-y-6">
              {doctor.bio && (
                <section>
                  <h2 className="font-bold text-dark-900 mb-1">نبذة</h2>
                  <p className="text-slate-700 leading-relaxed">{doctor.bio}</p>
                </section>
              )}
              <section>
                <h2 className="font-bold text-dark-900 mb-2">المؤهلات العلمية</h2>
                <QualificationsToggle qualifications={doctor.doctorQualification ?? []} />
              </section>
              <Link to={`/booking?doctorId=${doctor.id}`} className={buttonClasses('primary', 'lg', 'w-full')}>
                <CalendarClock size={18} /> احجز موعداً مع {doctor.fullName}
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
