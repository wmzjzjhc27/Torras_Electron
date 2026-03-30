/**
 * HTTP 请求封装 - 简化的 API 接口
 * 
 * 提供常用的 GET/POST/PUT/DELETE 等方法
 */

import axios from 'axios';
import { http } from './http';
import type { OptionalRequestConfig } from '@/types/http';

// ==================== 类型定义 ====================

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestParams {
  [key: string]: any;
}

interface RequestData {
  [key: string]: any;
}

// ==================== 核心请求方法 ====================

/**
 * 通用请求方法
 */
async function request<T = any>(
  method: RequestMethod,
  url: string,
  params?: RequestParams,
  data?: RequestData,
  config?: OptionalRequestConfig
): Promise<T> {
  const response = await http.request<T>({
    method,
    url,
    params,
    data,
    ...config,
  });

  return response.data as T;
}

// ==================== HTTP 方法封装 ====================

/**
 * GET 请求
 * @param url - 请求 URL
 * @param params - 查询参数
 * @param config - 额外配置
 */
export async function get<T = any>(
  url: string,
  params?: RequestParams,
  config?: OptionalRequestConfig
): Promise<T> {
  return request<T>('GET', url, params, undefined, config);
}

/**
 * POST 请求
 * @param url - 请求 URL
 * @param data - 请求体数据
 * @param config - 额外配置
 */
export async function post<T = any>(
  url: string,
  data?: RequestData,
  config?: OptionalRequestConfig
): Promise<T> {
  return request<T>('POST', url, undefined, data, config);
}

/**
 * PUT 请求
 * @param url - 请求 URL
 * @param data - 请求体数据
 * @param config - 额外配置
 */
export async function put<T = any>(
  url: string,
  data?: RequestData,
  config?: OptionalRequestConfig
): Promise<T> {
  return request<T>('PUT', url, undefined, data, config);
}

/**
 * DELETE 请求
 * @param url - 请求 URL
 * @param params - 查询参数
 * @param config - 额外配置
 */
export async function deleteFn<T = any>(
  url: string,
  params?: RequestParams,
  config?: OptionalRequestConfig
): Promise<T> {
  return request<T>('DELETE', url, params, undefined, config);
}

/**
 * PATCH 请求
 * @param url - 请求 URL
 * @param data - 请求体数据
 * @param config - 额外配置
 */
export async function patch<T = any>(
  url: string,
  data?: RequestData,
  config?: OptionalRequestConfig
): Promise<T> {
  return request<T>('PATCH', url, undefined, data, config);
}

// ==================== 便捷方法 ====================

/**
 * 下载文件
 */
export async function download(
  url: string,
  filename?: string,
  config?: OptionalRequestConfig
): Promise<Blob> {
  const response = await http.get(url, {
    responseType: 'blob',
    ...config,
  });

  // 触发浏览器下载
  if (filename) {
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  return response.data as Blob;
}

/**
 * 上传文件
 * @param url - 上传 URL
 * @param file - 文件对象
 * @param onProgress - 进度回调
 * @param config - 额外配置
 */
export async function upload<T = any>(
  url: string,
  file: File,
  onProgress?: (percentage: number) => void,
  config?: OptionalRequestConfig
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await http.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentage);
      }
    },
    ...config,
  });

  return response.data as T;
}

/**
 * 多文件上传
 */
export async function uploadMultiple<T = any>(
  url: string,
  files: File[],
  onProgress?: (percentage: number) => void,
  config?: OptionalRequestConfig
): Promise<T> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await http.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentage);
      }
    },
    ...config,
  });

  return response.data as T;
}

import type { Canceler } from 'axios';

// ==================== 请求取消 ====================

/**
 * 创建取消令牌源
 */
export const CancelToken = axios.CancelToken;

/**
 * 取消令牌源类型
 */
export interface CancelTokenSource {
  token: any;
  cancel: Canceler;
}

/**
 * 创建取消令牌
 */
export function createCancelToken(): CancelTokenSource {
  return axios.CancelToken.source();
}

// ==================== 导出默认对象 ====================

const httpRequest = {
  get,
  post,
  put,
  delete: deleteFn,
  patch,
  download,
  upload,
  uploadMultiple,
  request,
};

export default httpRequest;
