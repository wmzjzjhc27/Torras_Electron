/**
 * 路由守卫组件
 * 
 * 用于保护需要登录验证的路由
 * 如果用户未登录，自动重定向到登录页
 * 
 * @param children - 受保护的子组件
 * @param requireAuth - 是否需要认证（默认 true）
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, initialized } = useAuthContext();
  
  // 🔍 调试日志
  console.log('🛡️ ProtectedRoute:', {
    path: location.pathname,
    requireAuth,
    isAuthenticated,
    initialized,
    timestamp: new Date().toLocaleTimeString(),
  });
  
  // 🚨 关键优化 1: 等待认证状态初始化完成
  // 这可以防止在状态确定前渲染任何子组件
  if (!initialized) {
    console.log('⏳ 认证状态未初始化，显示加载动画');
    return null; // 返回 null 而不是 PageLoader，因为外层 Suspense 会处理
  }
  
  // 🚨 关键优化 2: 已登录用户访问登录页，自动跳转到首页
  if (isAuthenticated && location.pathname === '/login') {
    console.log('✅ 用户已登录，访问登录页，自动跳转到首页');
    return <Navigate to="/home" replace />;
  }
  
  // 🚨 关键优化 3: 在渲染子组件之前立即拦截
  // 如果需要认证但用户未登录，立即重定向，防止子组件渲染
  if (requireAuth && !isAuthenticated) {
    console.log('⚠️ 未授权访问，拦截并跳转到登录页');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // ✅ 认证通过或不需要认证，渲染子组件
  console.log('✅ 认证通过，渲染子组件');
  return <>{children}</>;
}
