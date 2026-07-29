import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogOut, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.svg';
import { dashboardPathForRole } from '../../utils/roles';
import { buttonClasses } from '../ui/buttonStyles';

const NAV_LINKS = [
  { to: '/', label: 'الرئيسية' },
  { to: '/booking', label: 'حجز موعد' },
  { to: '/ai-chat', label: 'استشارة ذكية' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnread } = useNotifications();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        <Link to="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="شعار أديم" className="h-12 sm:h-14 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">{link.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={dashboardPathForRole(user.role)}
                className={buttonClasses('primary', 'md', 'relative')}
              >
                <i className="fas fa-th-large"></i> لوحة التحكم
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </Link>

              <button onClick={handleLogout} className={buttonClasses('outline-danger', 'md')}>
                <LogOut size={18} />
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonClasses('outline-brand', 'md')}>دخول</Link>
              <Link to="/register" className={buttonClasses('primary', 'md')}>حساب جديد</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-2 -m-2 text-slate-600 hover:text-brand-600 transition-colors"
          aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-sm px-4 py-4 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-3 text-sm font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-slate-100 my-2" />

          {user ? (
            <>
              <Link
                to={dashboardPathForRole(user.role)}
                onClick={() => setMenuOpen(false)}
                className={buttonClasses('primary', 'md', 'relative w-full')}
              >
                <i className="fas fa-th-large"></i> لوحة التحكم
                {totalUnread > 0 && (
                  <span className="absolute -top-1.5 end-4 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </Link>

              <button onClick={handleLogout} className={buttonClasses('outline-danger', 'md', 'mt-2 w-full')}>
                <LogOut size={18} />
                خروج
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className={buttonClasses('outline-brand', 'md', 'w-full')}>دخول</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className={buttonClasses('primary', 'md', 'w-full')}>حساب جديد</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}