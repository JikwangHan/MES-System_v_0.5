import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  company?: {
    id: number;
    code: string;
    name: string;
  } | null;
  phone?: string | null;
  companyName?: string | null;
  lastLoginAt?: string | null;
  lastPasswordChangedAt?: string | null;
  mustChangePassword?: boolean;
};

type AuthContextState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: (payload: { username: string; password: string; companyCode?: string }) => Promise<AuthUser | null>;
  logout: () => void;
  signup: (payload: {
    username: string;
    displayName: string;
    password: string;
    passwordConfirm: string;
    role?: string;
    companyCode?: string;
    companyName?: string;
    phone?: string;
  }) => Promise<void>;
  refreshMe: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const init = async () => {
      if (token) {
        await refreshMe();
      }
      setLoading(false);
    };
    init();
  }, []);

  const login: AuthContextState['login'] = async ({ username, password, companyCode }) => {
    const { data } = await api.post('/auth/login', { username, password, companyCode });
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
    // 시스템 관리자일 경우 회사 선택 초기화, 회사 사용자는 자신의 회사 코드 저장
    if (data.user?.company?.code) {
      localStorage.setItem('current_company_code', data.user.company.code);
    }
    return data.user as AuthUser;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_company_code');
    setUser(null);
  };

  const signup: AuthContextState['signup'] = async (payload) => {
    await api.post('/auth/signup', payload);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      if (data?.company?.code) {
        localStorage.setItem('current_company_code', data.company.code);
      }
    } catch (e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_company_code');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout,
        signup,
        refreshMe,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthContext not found');
  return ctx;
};
