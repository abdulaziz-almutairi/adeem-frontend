import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (data: any) => Promise<void>;
  registerDoctor: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adeem_auth_token');
    const savedUser = localStorage.getItem('adeem_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('adeem_auth_token');
        localStorage.removeItem('adeem_user');
      }
    }
    setIsLoading(false);
  }, []);

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

  const registerPatient = async (data: any) => {
    await authApi.registerPatient(data);
  };

  const registerDoctor = async (data: any) => {
    // 
    await authApi.registerDoctor(data);
    // 
  };

  const logout = () => {
    localStorage.removeItem('adeem_auth_token');
    localStorage.removeItem('adeem_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, registerPatient, registerDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};