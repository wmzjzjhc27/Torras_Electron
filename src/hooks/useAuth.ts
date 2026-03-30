/**
 * 认证 Hook - 提供用户认证相关功能
 * 
 * 包含登录、登出、用户信息管理等
 */

import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: 'admin' | 'user' | 'guest';
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * 使用认证 Hook
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { user, login, logout, isAuthenticated, loading } = useAuth();
 *   
 *   if (loading) return <div>加载中...</div>;
 *   
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <span>欢迎，{user?.username}</span>
 *       ) : (
 *         <button onClick={() => login({username: 'admin', password: '123'})}>登录</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时检查用户登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');

      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      
      // TODO: 替换为真实的 API 调用
      // const response = await api.post('/login', credentials);
      
      // 模拟登录请求
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
    // 清除本地存储
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // 清除用户状态
    setUser(null);
  }, []);

  /**
   * 是否已认证
   */
  const isAuthenticated = !!user;

  /**
   * 更新用户信息
   */
  const updateUser = useCallback((newInfo: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...newInfo };
      localStorage.setItem('user_info', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading,
    checkAuthStatus,
  };
}
