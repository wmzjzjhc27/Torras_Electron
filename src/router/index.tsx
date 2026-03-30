import { createBrowserRouter, createHashRouter, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { PageLayout } from '@/components/PageLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageLoader } from '@/components/PageLoader'
import { Home, About, Login, NotFound, Help, DeviceManager } from './lazyLoad'

/**
 * 路由配置
 * 
 * 在此处定义所有页面路由
 * path: 路由路径
 * element: 路由对应的组件
 * children: 子路由（可选）
 * 
 * 路由守卫说明：
 * - 公开路由：无需登录即可访问（如 /login, /register）
 * - 受保护路由：需要登录验证（如 /home, /about）
 * - 使用 ProtectedRoute 组件包裹需要保护的路由
 */

// 检测运行环境：Electron 或 Web
// 在 Electron 打包环境中，由于使用 file:// 协议，必须使用 HashRouter
const isElectron = () => {
  // 检查是否在 Electron 渲染进程中
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined' && 
         window.electronAPI?.isElectron === true;
};

// 延迟检测，确保 preload.js 已经执行
let _isElectron: boolean | null = null;
const checkEnvironment = () => {
  if (_isElectron === null) {
    _isElectron = isElectron();
  }
  return _isElectron;
};

// 根据环境选择路由创建函数
const getRouterCreator = () => {
  const electronEnv = checkEnvironment();
  console.log('[Router] 环境检测结果:', electronEnv ? 'Electron' : 'Web/Browser');
  return electronEnv ? createHashRouter : createBrowserRouter;
};

const createRouter = getRouterCreator();

export const router = createRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/home" replace />,
      },
      {
        // ✅ 受保护的路由 - 需要登录才能访问
        path: 'home',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <Home />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        // ✅ 受保护的路由 - 需要登录才能访问
        path: 'about',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <About />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        // ✅ 受保护的路由 - 需要登录才能访问
        path: 'help',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <Help />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // 📱 设备管理模块
      {
        path: 'devices',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <DeviceManager />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            path: '*'
          }
        ]
      },
      // 📊 日志中心模块（占位页面）
      {
        path: 'logs/*',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <div style={{ padding: 24 }}>
                <h2>日志中心</h2>
                <p>该模块正在开发中...</p>
              </div>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // ⚙️ 系统配置模块（占位页面）
      {
        path: 'settings/*',
        element: (
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<PageLoader />}>
              <div style={{ padding: 24 }}>
                <h2>系统配置</h2>
                <p>该模块正在开发中...</p>
              </div>
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    // 🔓 公开路由 - 无需登录即可访问
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    // ⚠️ 404 页面 - 独立路由，不使用 PageLayout
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
])
