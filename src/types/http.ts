/**
 * HTTP 请求/响应类型定义
 * 
 * 提供完整的类型安全支持
 */

import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// ==================== 基础类型 ====================

/**
 * HTTP 请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * 请求数据泛型约束
 */
export interface RequestData {
  [key: string]: any;
}

/**
 * 响应数据结构
 * @template T - 响应数据的实际类型
 */
export interface ApiResponse<T = any> {
  code: number;        // 业务状态码
  message: string;     // 业务消息
  data: T;            // 实际数据
  timestamp?: number; // 时间戳
  requestId?: string; // 请求 ID（用于追踪）
}

/**
 * 分页响应数据结构
 * @template T - 列表项的类型
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;      // 当前页码
    pageSize: number;  // 每页数量
    total: number;     // 总数量
    totalPages: number;// 总页数
  };
}

// ==================== 错误类型 ====================

/**
 * 业务错误码
 */
export const BusinessErrorCode = {
  SUCCESS: 0,              // 成功
  UNAUTHORIZED: 401,       // 未授权
  FORBIDDEN: 403,          // 禁止访问
  NOT_FOUND: 404,          // 资源不存在
  INTERNAL_ERROR: 500,     // 服务器内部错误
  BAD_REQUEST: 400,        // 请求参数错误
  NETWORK_ERROR: 1000,     // 网络错误
  TIMEOUT_ERROR: 1001,     // 请求超时
  CANCEL_ERROR: 1002,      // 请求取消
  PARSE_ERROR: 1003,       // 解析错误
} as const;

export type BusinessErrorCodeType = typeof BusinessErrorCode[keyof typeof BusinessErrorCode];

/**
 * 自定义错误类
 */
export class HttpError extends Error {
  code: number;
  status?: number;
  data?: any;
  request?: any;

  constructor(
    message: string,
    code: number = BusinessErrorCode.INTERNAL_ERROR,
    status?: number,
    data?: any,
    request?: any
  ) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.status = status;
    this.data = data;
    this.request = request;

    // 保持正确的原型链
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /**
   * 判断是否是业务错误
   */
  isBusinessError(): boolean {
    return this.code !== BusinessErrorCode.NETWORK_ERROR &&
           this.code !== BusinessErrorCode.TIMEOUT_ERROR &&
           this.code !== BusinessErrorCode.CANCEL_ERROR;
  }
}

// ==================== 请求配置扩展 ====================

/**
 * 扩展的 Axios 请求配置
 */
export interface HttpRequestConfig<T = any> extends AxiosRequestConfig {
  /** 是否显示加载提示 */
  showLoading?: boolean;
  /** 是否显示错误提示 */
  showError?: boolean;
  /** 是否显示成功提示 */
  showSuccess?: boolean;
  /** 自定义错误处理函数 */
  onError?: (error: HttpError) => void;
  /** 自定义成功处理函数 */
  onSuccess?: (response: T) => void;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 是否需要认证 token */
  needAuth?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * 请求拦截器配置
 */
export interface RequestInterceptor {
  onFulfilled?: (config: HttpRequestConfig) => Promise<HttpRequestConfig | void> | HttpRequestConfig | void;
  onRejected?: (error: any) => Promise<any>;
}

/**
 * 响应拦截器配置
 */
export interface ResponseInterceptor<T = any> {
  onFulfilled?: (response: AxiosResponse<T>) => Promise<AxiosResponse<T> | void> | AxiosResponse<T> | void;
  onRejected?: (error: AxiosError) => Promise<any>;
}

// ==================== 工具类型 ====================

/**
 * 移除 ApiResponse 包装，直接获取数据类型
 */
export type UnwrapResponse<T> = T extends ApiResponse<infer U> ? U : T;

/**
 * 可选的配置参数
 */
export type OptionalRequestConfig = Partial<HttpRequestConfig>;

/**
 * 上传进度回调
 */
export interface UploadProgress {
  loaded: number;      // 已加载字节数
  total: number;       // 总字节数
  percentage: number;  // 完成百分比
}

/**
 * 下载进度回调
 */
export interface DownloadProgress extends UploadProgress {
  fileName?: string;   // 文件名
}
