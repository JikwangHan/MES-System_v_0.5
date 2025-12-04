import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

export type AuthUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  phone?: string | null;
  companyName?: string | null;
  lastLoginAt?: string | null;
  lastPasswordChangedAt?: string | null;
  mustChangePassword?: boolean;
};

type AuthContextState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (payload: { username: string; password: string; companyCode?: string }) => Promise<AuthUser | null>;
  logout: () => void;
  signup: (payload: {
    username: string;
    displayName: string;
    password: string;
    passwordConfirm: string;
    role?: string;
    companyName?: string;
    phone?: string;
  }) => Promise<void>;
  refreshMe: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) refreshMe();
  }, []);

  const login: AuthContextState['login'] = async ({ username, password, companyCode }) => {
    const { data } = await api.post('/auth/login', { username, password, companyCode });
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
    return data.user as AuthUser;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const signup: AuthContextState['signup'] = async (payload) => {
    await api.post('/auth/signup', payload);
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (e) {
      localStorage.removeItem('access_token');
      setUser(null);
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
