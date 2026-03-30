import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/PageLoader'
import './index.css'
import { router } from '@/router'
import { registerServiceWorker } from '@/utils/serviceWorker'
import { getDevicePerformance } from '@/utils/performance'

// 初始化国际化
import '@/i18n/config'

// 注册 Service Worker（生产环境）
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => {
      console.log('[SW] 应用已缓存，可离线使用');
    },
    onUpdate: (registration) => {
      console.log('[SW] 有新版本可用，请刷新页面');
      // 可以在这里显示更新提示
      if (confirm('发现新版本，是否立即刷新？')) {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    },
  });
}

// 检测设备性能并应用优化策略
const devicePerf = getDevicePerformance();
console.log('[Performance] 设备性能检测:', devicePerf);

// 根据设备性能添加全局类名
if (devicePerf.isLowEnd) {
  document.documentElement.classList.add('device-low-end');
} else if (devicePerf.isMidRange) {
  document.documentElement.classList.add('device-mid-range');
} else {
  document.documentElement.classList.add('device-high-end');
}

function AppWrapper() {
  const [loading, setLoading] = useState(true);

  // PageLoader 会通过 onLoadComplete 回调来通知加载完成
  // 这里不需要额外的定时器，由 PageLoader 监听真实的页面加载事件

  return (
    <>
      <PageLoader onLoadComplete={() => setLoading(false)} />
      {!loading && (
        <StrictMode>
          <AuthProvider>
            <ConfigProvider
              locale={zhCN}
              theme={{
                token: {
                  colorPrimary: '#667eea',
                  borderRadius: 6,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                },
                components: {
                  Card: {
                    borderRadiusLG: 12,
                  },
                  Button: {
                    borderRadius: 6,
                  },
                  Input: {
                    borderRadius: 6,
                  },
                },
              }}
            >
              <RouterProvider router={router} />
            </ConfigProvider>
          </AuthProvider>
        </StrictMode>
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <AppWrapper />,
)
