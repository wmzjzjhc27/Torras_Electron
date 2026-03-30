/**
 * Service Worker 注册与管理
 * 
 * 功能：
 * - 离线缓存
 * - 网络代理
 * - 后台同步
 */

const SW_URL = '/sw.js';
const SW_SCOPE = '/';

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

/**
 * 注册 Service Worker
 */
export function registerServiceWorker(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker 不支持');
    return Promise.resolve(null);
  }

  return navigator.serviceWorker
    .register(SW_URL, { scope: SW_SCOPE })
    .then((registration) => {
      console.log('[SW] Service Worker 注册成功:', registration.scope);

      // 检查更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('[SW] 有新版本可用');
              config.onUpdate?.(registration);
            } else {
              // 首次安装
              console.log('[SW] 内容已缓存可供离线使用');
              config.onSuccess?.(registration);
            }
          }
        });
      });

      return registration;
    })
    .catch((error) => {
      console.error('[SW] Service Worker 注册失败:', error);
      return null;
    });
}

/**
 * 注销 Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.unregister();
}

/**
 * 向 Service Worker 发送消息
 */
export function postMessageToSW(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('没有活跃的 Service Worker'));
      return;
    }

    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    
    // 超时处理
    setTimeout(() => {
      reject(new Error('消息超时'));
    }, 5000);
  });
}

/**
 * 监听 Service Worker 消息
 */
export function onSWMessage(handler: (event: MessageEvent) => void): () => void {
  navigator.serviceWorker.addEventListener('message', handler);
  
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}
