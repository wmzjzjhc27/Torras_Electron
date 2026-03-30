/**
 * 认证上下文提供者
 * 
 * 提供全局认证状态管理，在应用启动时检查用户登录状态
 * 防止未登录用户访问受保护页面时出现页面闪烁
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'guest';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  checkAuthStatus: () => void;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 🎯 优化：使用立即执行函数在组件创建时就确定状态
  const getInitialAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');
      
      if (token && userInfo) {
        return JSON.parse(userInfo);
      }
    } catch (error) {
      console.error('初始化认证状态失败:', error);
    }
    return null;
  };
  
  const [user, setUser] = useState<User | null>(getInitialAuth());
  const [loading, setLoading] = useState(false); // 🎯 关键：初始化为 false，因为我们已经同步检查了
  // initialized 状态已固定为 true，不再需要 setInitialized

  /**
   * 检查认证状态 - 用于登录/登出后手动刷新状态
   */
  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');

      if (token && userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setUser(null);
    }
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      
      // TODO: 替换为真实的 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟登录成功
      const mockUser: User = {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        role: 'user',
      };

      // 保存用户信息
      localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now());
      localStorage.setItem('user_info', JSON.stringify(mockUser));
      
      setUser(mockUser);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('登录失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '登录失败' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    initialized: true, // 已经是初始化完成的状态
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证上下文的 Hook
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
