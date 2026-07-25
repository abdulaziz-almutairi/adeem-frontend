import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { dashboardPathForRole } from '../utils/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const savedUser = JSON.parse(localStorage.getItem('adeem_user') || '{}');
      navigate(dashboardPathForRole(savedUser.role));
    } catch (err: any) {
      const message = err.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 flex items-center justify-center adeem-bg px-4">
      <div className="relative z-10 bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-md">
            <i className="fas fa-circle-nodes text-white text-xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-dark-900">مرحباً بعودتك</h2>
          <p className="text-slate-500 text-sm mt-1">سجل دخولك للوصول لحسابك في أديم</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
            <i className="fas fa-exclamation-circle ml-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@adeem.com"
              className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
              required
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> جاري تسجيل الدخول...</>
            ) : (
              <><LogIn size={18} /> تسجيل الدخول</>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700">سجل الآن</Link>
        </p>
      </div>
    </div>
  );
}