/**
 * 路由懒加载配置
 * 
 * 实现组件按需加载，减少初始包体积
 */

import React, { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/PageLoader';

/**
 * 懒加载组件包装器
 * @param ComponentImport - 动态导入的组件
 */
function lazyLoad(ComponentImport: () => Promise<{ default: React.ComponentType<any> }>) {
  const Component = lazy(ComponentImport);
  
  return function LazyComponent(props: any) {
    return (
      <Suspense fallback={<PageLoader onLoadComplete={() => {}} />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// 页面懒加载 - 使用统一的目录结构
export const Home = lazyLoad(() => import('@/pages/Home'));
export const About = lazyLoad(() => import('@/pages/About'));
export const Login = lazyLoad(() => import('@/pages/Login'));
export const NotFound = lazyLoad(() => import('@/pages/NotFound'));
export const Help = lazyLoad(() => import('@/pages/Help'));
export const DeviceManager = lazyLoad(() => import('@/pages/DeviceManager'));
