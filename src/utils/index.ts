/**
 * 工具函数统一导出
 */

// ==================== HTTP 相关 ====================

// 类型导出
export type {
  HttpMethod,
  RequestData,
  ApiResponse,
  PaginatedResponse,
  HttpError,
  HttpRequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  UploadProgress,
  DownloadProgress,
  OptionalRequestConfig,
} from '@/types/http';

export { BusinessErrorCode } from '@/types/http';

// Axios 实例
export { http } from '@/utils/http';

// 请求方法
export {
  get,
  post,
  put,
  deleteFn as delete,
  patch,
  download,
  upload,
  uploadMultiple,
} from '@/utils/request';

// 取消令牌
export { CancelToken, createCancelToken } from '@/utils/request';
export type { CancelTokenSource } from '@/utils/request';

// 默认导出
export { default as httpRequest } from '@/utils/request';

// ==================== 性能优化相关 ====================

// 设备性能检测
export {
  getDevicePerformance,
  shouldEnableAnimations,
  shouldEnableGPUAcceleration,
  shouldPreloadResources,
  getImageQuality,
  getMaxConcurrentRequests,
} from '@/utils/performance';

// 性能监控
export {
  startPerformanceMonitoring,
  getPerformanceReport,
  evaluateCurrentPerformance,
  monitorRequestPerformance,
  analyzeRenderPerformance,
} from '@/utils/performanceMonitor';

// 资源预加载
export {
  preloadImage,
  preloadScript,
  preloadStyle,
  preloadFont,
  preloadData,
  preloadPage,
  preloadBatch,
  smartPreload,
  getPreloadStatus,
} from '@/utils/preload';

// Service Worker
export {
  registerServiceWorker,
  unregisterServiceWorker,
  postMessageToSW,
  onSWMessage,
} from '@/utils/serviceWorker';
