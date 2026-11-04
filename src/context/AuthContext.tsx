import { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (data: Parameters<typeof authApi.registerPatient>[0]) => Promise<void>;
  registerDoctor: (data: Parameters<typeof authApi.registerDoctor>[0]) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// يقرأ الجلسة المحفوظة مرة واحدة عند البداية؛ بيانات تالفة تُحذف ويبدأ المستخدم غير مسجّل
function readStoredUser(): User | null {
  const token = localStorage.getItem('adeem_auth_token');
  const savedUser = localStorage.getItem('adeem_user');
  if (!token || !savedUser) return null;
  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem('adeem_auth_token');
    localStorage.removeItem('adeem_user');
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  // الجلسة تُقرأ بشكل متزامن قبل أول عرض، فلا توجد مرحلة تحميل
  const isLoading = false;

  const login = async (email: string, password: string) => {
    const { token, role } = await authApi.login(email, password);

    if (!token) {
      throw new Error('لم يتم استلام توكن من الخادم');
    }

    // نخزن التوكن أولاً لأن /users/me يتطلب توثيق Bearer
    localStorage.setItem('adeem_auth_token', token);

    // استجابة /auth/login لا تتضمن سوى token/email/role، فنجلب بقية بيانات
    // الحساب من /users/me دايماً (حتى للطبيب) لأنها ترجع الـ User.id الحقيقي -
    // بينما /doctors/me يرجع DoctorProfile.id (رقم مختلف تماماً)، واستخدامه هنا
    // كان يكسر مقارنة senderId بالشات لأن الرسائل مرتبطة بالـ User.id
    const profile = await authApi.getMe();
    const userData: User = { ...profile, role: role as User['role'] };

    localStorage.setItem('adeem_user', JSON.stringify(userData));
    setUser(userData);
  };

  const registerPatient = async (data: Parameters<typeof authApi.registerPatient>[0]) => {
    await authApi.registerPatient(data);
  };

  const registerDoctor = async (data: Parameters<typeof authApi.registerDoctor>[0]) => {
    // 
    await authApi.registerDoctor(data);
    // 
  };

  const logout = () => {
    localStorage.removeItem('adeem_auth_token');
    localStorage.removeItem('adeem_user');
    setUser(null);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      localStorage.setItem('adeem_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerPatient, registerDoctor, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};