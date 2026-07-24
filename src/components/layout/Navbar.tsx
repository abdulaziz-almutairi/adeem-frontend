import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogOut } from 'lucide-react';
import logo from '../../assets/logo.svg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnread } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
  
        <Link to="/" className="flex items-center">
          <img src={logo} alt="شعار أديم" className="h-12 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">الرئيسية</Link>
          <Link to="/booking" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">حجز موعد</Link>
          <Link to="/ai-chat" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">استشارة ذكية</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}
                className="relative px-5 py-2 text-sm font-bold text-white bg-brand-gradient rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <i className="fas fa-th-large"></i> لوحة التحكم
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </Link>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
              >
                <LogOut size={18} />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 text-sm font-bold text-brand-600 border-2 border-brand-200 rounded-xl hover:bg-brand-50 transition-all">دخول</Link>
              <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-brand-gradient rounded-xl hover:shadow-lg transition-all">حساب جديد</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}