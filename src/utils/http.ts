/**
 * Axios HTTP 请求核心配置
 * 
 * 提供完整的请求拦截、响应处理、错误处理机制
 * 集成性能监控功能
 */

import axios from 'axios';
import { HttpError, BusinessErrorCode } from '@/types/http';
import type { HttpRequestConfig, ApiResponse } from '@/types/http';
import { monitorRequestPerformance } from './performanceMonitor';

// ==================== 默认配置 ====================

const defaultConfig: HttpRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
  showLoading: false,
  showError: true,
  showSuccess: false,
  needAuth: true,
  retryCount: 1,
  retryDelay: 1000,
};

// ==================== 创建 Axios 实例 ====================

export const http = axios.create(defaultConfig);

// ==================== 工具函数 ====================

/**
 * 显示加载提示（可集成 message/loading 组件）
 */
function showLoadingIndicator(message: string = '加载中...') {
  if (import.meta.env.DEV) {
    console.log(`[Loading] ${message}`);
  }
  // TODO: 集成实际的 Loading 组件，如：
  // ElLoading.service({ text: message });
}

/**
 * 隐藏加载提示
 */
function hideLoadingIndicator() {
  // TODO: 关闭实际的 Loading 组件
  // loading.close();
}

/**
 * 显示错误提示（可集成 message/error 组件）
 */
function showErrorNotification(message: string) {
  if (import.meta.env.DEV) {
    console.error(`[Error] ${message}`);
  }
  // TODO: 集成实际的消息提示组件，如：
  // ElMessage.error(message);
}

/**
 * 显示成功提示
 */
function showSuccessNotification(message: string) {
  if (import.meta.env.DEV) {
    console.log(`[Success] ${message}`);
  }
  // TODO: 集成实际的消息提示组件，如：
  // ElMessage.success(message);
}

// ==================== 请求拦截器 ====================

http.interceptors.request.use(
  (config) => {
    const httpConfig = config as HttpRequestConfig;
    
    // 记录请求开始时间（用于性能监控）
    (config as any).__requestStartTime = performance.now();
    
    // 显示加载提示
    if (httpConfig.showLoading) {
      showLoadingIndicator('正在加载...');
    }

    // 添加认证 Token
    if (httpConfig.needAuth !== false) {
      const token = getToken();
      if (token && httpConfig.headers) {
        (httpConfig.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    // 添加请求时间戳（防止 GET 请求缓存）
    if (httpConfig.method === 'GET' && httpConfig.params) {
      httpConfig.params._t = Date.now();
    }

    // 开发环境日志
    if (import.meta.env.DEV) {
      console.group('[HTTP Request]');
      console.log('URL:', httpConfig.url);
      console.log('Method:', httpConfig.method);
      console.log('Params:', httpConfig.params);
      console.log('Data:', httpConfig.data);
      console.log('Headers:', httpConfig.headers);
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== 响应拦截器 ====================

http.interceptors.response.use(
  (response) => {
    const config = response.config as HttpRequestConfig;

    // 性能监控
    const startTime = (config as any).__requestStartTime;
    if (startTime) {
      const duration = monitorRequestPerformance(
        response.config.url || '',
        startTime
      );
      
      // 慢请求警告
      if (duration > 2000) {
        console.warn(`[HTTP Performance] ⚠️ Slow request: ${response.config.url} (${duration.toFixed(2)}ms)`);
      }
    }

    // 隐藏加载提示
    if (config.showLoading) {
      hideLoadingIndicator();
    }

    // 开发环境日志
    if (import.meta.env.DEV) {
      console.group('[HTTP Response]');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
    }

    // 检查业务状态码
    const res = response.data as ApiResponse;
    
    // 如果响应数据符合 ApiResponse 格式
    if (res && typeof res.code !== 'undefined') {
      const { code, message } = res;

      // 成功响应
      if (code === BusinessErrorCode.SUCCESS || code === 200) {
        if (config.showSuccess) {
          showSuccessNotification(message || '操作成功');
        }
        return response;
      }

      // 业务错误处理
      const error = new HttpError(
        message || '请求失败',
        code,
        response.status,
        res
      );

      // 自定义错误处理
      if (config.onError) {
        config.onError(error);
      } else if (config.showError !== false) {
        showErrorNotification(message);
      }

      return Promise.reject(error);
    }

    // 普通响应（非 ApiResponse 格式）
    return response;
  },
  async (error: any) => {
    const config = error.config as HttpRequestConfig;

    // 隐藏加载提示
    if (config.showLoading) {
      hideLoadingIndicator();
    }

    // 处理取消请求
    if (axios.isCancel(error)) {
      const cancelError = new HttpError(
        '请求已取消',
        BusinessErrorCode.CANCEL_ERROR
      );
      return Promise.reject(cancelError);
    }

    // 网络错误处理
    let errorMessage = '网络错误，请检查网络连接';
    let errorCode: number = BusinessErrorCode.NETWORK_ERROR;

    if (error.response) {
      // 服务器返回错误响应
      const status = error.response.status;
      const data = error.response.data as any;

      errorMessage = getErrorMessageByStatus(status, data?.message);
      errorCode = getErrorCodeByStatus(status);

      // Token 过期处理
      if (status === BusinessErrorCode.UNAUTHORIZED) {
        handleUnauthorized();
      }
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      errorMessage = '请求超时，请重试';
      errorCode = BusinessErrorCode.TIMEOUT_ERROR;
    }

    // 创建错误对象
    const httpError = new HttpError(
      errorMessage,
      errorCode,
      error.response?.status,
      error.response?.data,
      error.request
    );

    // 自定义错误处理
    if (config.onError) {
      config.onError(httpError);
    } else if (config.showError !== false) {
      showErrorNotification(errorMessage);
    }

    // 重试机制
    if (shouldRetry(config, error)) {
      return retryRequest(config, error);
    }

    return Promise.reject(httpError);
  }
);

// ==================== 辅助函数 ====================

/**
 * 获取 Token（从 localStorage 或其他存储）
 */
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * 处理未授权情况
 */
function handleUnauthorized() {
  // 清除 Token
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // 跳转到登录页（需要时启用）
  // if (typeof window !== 'undefined') {
  //   window.location.href = '/login';
  // }

  console.warn('[HTTP] Token 已过期，请重新登录');
}

/**
 * 根据 HTTP 状态码获取错误消息
 */
function getErrorMessageByStatus(status: number, customMessage?: string): string {
  if (customMessage) return customMessage;

  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求的资源不存在',
    408: '请求超时',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  };

  return messages[status] || `请求失败 (${status})`;
}

/**
 * 根据 HTTP 状态码获取业务错误码
 */
function getErrorCodeByStatus(status: number): number {
  const codeMap: Record<number, number> = {
    400: BusinessErrorCode.BAD_REQUEST,
    401: BusinessErrorCode.UNAUTHORIZED,
    403: BusinessErrorCode.FORBIDDEN,
    404: BusinessErrorCode.NOT_FOUND,
    500: BusinessErrorCode.INTERNAL_ERROR,
  };

  return codeMap[status] || BusinessErrorCode.INTERNAL_ERROR;
}

/**
 * 判断是否应该重试
 */
function shouldRetry(config: HttpRequestConfig, error: any): boolean {
  const retryCount = config.retryCount ?? defaultConfig.retryCount!;
  
  // 网络错误或超时可以重试
  const canRetry = !error.response || error.response.status >= 500;
  
  return canRetry && retryCount > 0;
}

/**
 * 重试请求
 */
async function retryRequest(config: HttpRequestConfig, _error: any): Promise<any> {
  const retryCount = config.retryCount ?? defaultConfig.retryCount!;
  const retryDelay = config.retryDelay ?? defaultConfig.retryDelay!;

  console.log(`[HTTP] 重试请求，剩余次数：${retryCount - 1}`);

  // 延迟后重试
  await new Promise(resolve => setTimeout(resolve, retryDelay));

  // 减少重试次数
  config.retryCount = retryCount - 1;

  return http.request(config);
}

// ==================== 导出 ====================

export default http;
