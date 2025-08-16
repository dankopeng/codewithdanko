/**
 * 認證相關的 React hooks
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from '@remix-run/react';
import type { ReactNode } from 'react';
import { 
  User, 
  LoginRequest, 
  SignupRequest, 
  getUser, 
  isAuthenticated, 
  storeAuth, 
  clearAuth 
} from './auth';
import { clientFetch, ApiError } from './api';

// 認證上下文類型
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

// 創建認證上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 認證提供者組件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 初始化時檢查用戶狀態
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // 檢查本地存儲中的用戶信息
        if (isAuthenticated()) {
          const storedUser = getUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // 如果沒有用戶信息但有令牌，嘗試獲取用戶信息
            await refreshUser();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // 如果出錯，清除認證信息
        clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 登錄
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await clientFetch<{
        id: number;
        email: string;
        token: string;
        expiresIn: number;
      }>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // 存儲認證信息
      const user = { id: response.id, email: response.email };
      storeAuth(response.token, user, response.expiresIn);
      setUser(user);
      
      // 導航到儀表板
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // 註冊
  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      const response = await clientFetch<{
        id: number;
        email: string;
        token: string;
        expiresIn: number;
      }>('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // 存儲認證信息
      const user = { id: response.id, email: response.email };
      storeAuth(response.token, user, response.expiresIn);
      setUser(user);
      
      // 導航到儀表板
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // 登出
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // 嘗試調用登出 API
      await clientFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
      // 即使 API 調用失敗，也繼續本地登出
    } finally {
      // 清除本地認證信息
      clearAuth();
      setUser(null);
      setIsLoading(false);
      
      // 導航到登錄頁面
      navigate('/login');
    }
  }, [navigate]);

  // 刷新用戶信息
  const refreshUser = useCallback(async () => {
    try {
      const userData = await clientFetch<{ user: User }>('/auth/me');
      setUser(userData.user);
      return userData.user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // 未認證，清除本地信息
        clearAuth();
        setUser(null);
      }
      throw error;
    }
  }, []);

  // 提供認證上下文
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用認證 hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 高階組件，用於保護需要認證的路由
export function withAuth(Component: React.ComponentType<any>) {
  const WithAuthComponent = (props: any) => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !user) {
        const dest = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard';
        navigate(`/login?redirectTo=${encodeURIComponent(dest)}`);
      }
    }, [user, isLoading, navigate]);

    if (isLoading) {
      return (
        <div>Loading...</div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
  
  return WithAuthComponent;
}
