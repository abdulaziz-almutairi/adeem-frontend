import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2, ShieldCheck, ShieldX, UserX, Users, Stethoscope } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { DoctorProfile, User } from '../../types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge, { type BadgeVariant } from '../../components/ui/Badge';

type RoleFilter = 'ALL' | User['role'];

const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  ALL: 'الكل',
  PATIENT: 'مرضى',
  DOCTOR: 'أطباء',
  ADMIN: 'مشرفون',
};

const ROLE_FILTERS: RoleFilter[] = ['ALL', 'PATIENT', 'DOCTOR', 'ADMIN'];

const ROLE_BADGE_VARIANT: Record<User['role'], BadgeVariant> = {
  PATIENT: 'brand',
  DOCTOR: 'success',
  ADMIN: 'warning',
};

const ROLE_LABEL: Record<User['role'], string> = {
  PATIENT: 'مريض',
  DOCTOR: 'طبيب',
  ADMIN: 'مشرف',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'doctors' | 'users'>('doctors');

  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState('');
  const [decidingId, setDecidingId] = useState<number | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  const fetchPendingDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await adminApi.getPendingDoctors();
      setDoctorsError('');
      setPendingDoctors(res);
    } catch (err) {
      console.error('فشل جلب طلبات التوثيق:', err);
      setDoctorsError('تعذّر جلب طلبات التوثيق حالياً');
    } finally {
      setDoctorsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminApi.getAllUsers();
      setUsersError('');
      setUsers(res);
    } catch (err) {
      console.error('فشل جلب المستخدمين:', err);
      setUsersError('تعذّر جلب المستخدمين حالياً');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => { fetchPendingDoctors(); fetchUsers(); }, []);

  const handleVerification = async (doctorProfileId: number, status: 'VERIFIED' | 'REJECTED') => {
    if (status === 'REJECTED' && !window.confirm('هل أنت متأكد من رفض طلب توثيق هذا الطبيب؟')) return;
    setDecidingId(doctorProfileId);
    try {
      await adminApi.updateDoctorVerification(doctorProfileId, status);
      setPendingDoctors(prev => prev.filter(d => d.id !== doctorProfileId));
    } catch (err) {
      console.error('فشل تحديث حالة التوثيق:', err);
      window.alert('تعذّر تحديث حالة التوثيق، حاول مرة أخرى');
    } finally {
      setDecidingId(null);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب "${targetUser.fullName}"؟ هذا الإجراء لا يمكن التراجع عنه`)) return;
    setDeletingId(targetUser.id);
    try {
      await adminApi.deleteUser(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
    } catch (err) {
      console.error('فشل حذف المستخدم:', err);
      window.alert('تعذّر حذف المستخدم، حاول مرة أخرى');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter(u => u.role === roleFilter);
  }, [users, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<RoleFilter, number> = { ALL: users.length, PATIENT: 0, DOCTOR: 0, ADMIN: 0 };
    users.forEach(u => { counts[u.role]++; });
    return counts;
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-900">مرحباً، {user?.fullName}</h1>
            <p className="text-slate-500">لوحة تحكم المشرف - منصة أديم</p>
          </div>
          <Button variant="outline-danger" onClick={handleLogout}><LogOut size={18} /> تسجيل الخروج</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto whitespace-nowrap pb-1 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'doctors' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Stethoscope size={16} /> طلبات توثيق الأطباء
            {pendingDoctors.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'doctors' ? 'bg-white/20 text-white' : 'bg-warning-100 text-warning-700'}`}>
                {pendingDoctors.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            <Users size={16} /> المستخدمون
          </button>
        </div>

        {/* Pending doctor verifications */}
        {activeTab === 'doctors' && (
          doctorsLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : doctorsError ? (
            <Alert variant="danger">{doctorsError}</Alert>
          ) : pendingDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              <ShieldCheck className="mx-auto mb-2" size={32} />
              <p>لا توجد طلبات توثيق معلقة حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDoctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-dark-900">{doc.fullName}</h3>
                      <Badge variant="warning">بانتظار التوثيق</Badge>
                    </div>
                    <p className="text-sm text-brand-600 font-semibold">{doc.specialty}</p>
                    <p className="text-sm text-slate-500 break-all" dir="ltr">{doc.email} · {doc.phoneNumber}</p>
                    <p className="text-sm text-slate-500">رقم الترخيص: <span dir="ltr">{doc.licenseNumber}</span></p>
                    <p className="text-sm text-slate-500">سعر الجلسة: {doc.pricePerSession} ر.س</p>
                    {doc.bio && <p className="text-xs text-slate-400 mt-1">{doc.bio}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      variant="solid-success"
                      onClick={() => handleVerification(doc.id, 'VERIFIED')}
                      loading={decidingId === doc.id}
                    >
                      {decidingId !== doc.id && <ShieldCheck size={16} />} قبول
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleVerification(doc.id, 'REJECTED')}
                      disabled={decidingId === doc.id}
                    >
                      <ShieldX size={16} /> رفض
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Users management */}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {ROLE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${roleFilter === f ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {ROLE_FILTER_LABELS[f]} ({roleCounts[f]})
                </button>
              ))}
            </div>

            {usersLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
            ) : usersError ? (
              <Alert variant="danger">{usersError}</Alert>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
                <Users className="mx-auto mb-2" size={32} />
                <p>لا يوجد مستخدمون في هذا التصنيف</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(u => (
                  <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-dark-900 truncate">{u.fullName}</h3>
                        <Badge variant={ROLE_BADGE_VARIANT[u.role]} className="shrink-0">{ROLE_LABEL[u.role]}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 break-all" dir="ltr">{u.email}{u.phoneNumber ? ` · ${u.phoneNumber}` : ''}</p>
                      <p className="text-xs text-slate-400">انضم في {formatDate(u.createdAt)}</p>
                    </div>

                    {u.id !== user?.id ? (
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDeleteUser(u)}
                        loading={deletingId === u.id}
                        className="shrink-0"
                      >
                        {deletingId !== u.id && <UserX size={16} />} حذف
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 shrink-0">هذا حسابك</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
