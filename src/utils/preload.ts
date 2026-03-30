/**
 * 资源预加载工具
 * 
 * 功能：
 * - 智能预加载关键资源
 * - 根据设备性能和网络状态调整策略
 * - 优先级队列管理
 */

import { shouldPreloadResources, getMaxConcurrentRequests } from './performance';

export type ResourceType = 'image' | 'script' | 'style' | 'font' | 'data' | 'page';

export interface ResourceItem {
  url: string;
  type: ResourceType;
  priority: 'high' | 'medium' | 'low';
  as?: string;
  crossorigin?: boolean;
}

class PreloadManager {
  private preloadQueue: ResourceItem[] = [];
  private loadedUrls = new Set<string>();
  private loadingUrls = new Set<string>();
  private maxConcurrent: number;

  constructor() {
    this.maxConcurrent = getMaxConcurrentRequests();
  }

  /**
   * 添加预加载任务
   */
  add(resource: ResourceItem) {
    if (this.loadedUrls.has(resource.url) || this.loadingUrls.has(resource.url)) {
      return;
    }

    this.preloadQueue.push(resource);
    this.processQueue();
  }

  /**
   * 批量添加预加载任务
   */
  addBatch(resources: ResourceItem[]) {
    resources.forEach(resource => this.add(resource));
  }

  /**
   * 处理队列
   */
  private async processQueue() {
    if (this.preloadQueue.length === 0) {
      return;
    }

    // 按优先级排序
    const sortedQueue = this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // 限制并发数
    while (this.loadingUrls.size < this.maxConcurrent && sortedQueue.length > 0) {
      const resource = sortedQueue.shift()!;
      this.preloadQueue = sortedQueue;
      
      this.loadingUrls.add(resource.url);
      
      // 不等待完成，继续处理下一个
      this.loadResource(resource).finally(() => {
        this.loadingUrls.delete(resource.url);
        this.loadedUrls.add(resource.url);
        this.processQueue();
      });
    }
  }

  /**
   * 加载单个资源
   */
  private loadResource(resource: ResourceItem): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[Preload] Loading: ${resource.url} (${resource.type})`);

      switch (resource.type) {
        case 'image':
          this.loadImage(resource.url).then(resolve).catch(reject);
          break;
        
        case 'script':
          this.loadScript(resource.url).then(resolve).catch(reject);
          break;
        
        case 'style':
          this.loadStyle(resource.url).then(resolve).catch(reject);
          break;
        
        case 'font':
          this.loadFont(resource.url).then(resolve).catch(reject);
          break;
        
        case 'data':
          this.loadData(resource.url).then(resolve).catch(reject);
          break;
        
        case 'page':
          this.loadPage(resource.url).then(resolve).catch(reject);
          break;
        
        default:
          resolve();
      }
    });
  }

  /**
   * 加载图片
   */
  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * 加载脚本
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * 加载样式表
   */
  private loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  /**
   * 加载字体
   */
  private loadFont(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const font = new FontFace('PreloadedFont', `url(${url})`);
      font.load().then((loadedFont) => {
        (document.fonts as any).add(loadedFont);
        resolve();
      }).catch(reject);
    });
  }

  /**
   * 加载数据（预取）
   */
  private async loadData(url: string): Promise<void> {
    try {
      await fetch(url, { priority: 'low' });
    } catch (error) {
      console.warn(`[Preload] Failed to preload data from ${url}:`, error);
    }
  }

  /**
   * 加载页面（预渲染准备）
   */
  private async loadPage(url: string): Promise<void> {
    try {
      // 预取 HTML
      await fetch(url, { priority: 'low' });
      console.log(`[Preload] Page preloaded: ${url}`);
    } catch (error) {
      console.warn(`[Preload] Failed to preload page ${url}:`, error);
    }
  }

  /**
   * 清除已加载的资源记录
   */
  clearLoadedUrls() {
    this.loadedUrls.clear();
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      pending: this.preloadQueue.length,
      loading: this.loadingUrls.size,
      loaded: this.loadedUrls.size,
    };
  }
}

// 单例模式
const preloadManager = new PreloadManager();

/**
 * 预加载图片
 */
export function preloadImage(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  preloadManager.add({
    url,
    type: 'image',
    priority,
  });
}

/**
 * 预加载脚本
 */
export function preloadScript(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  preloadManager.add({
    url,
    type: 'script',
    priority,
  });
}

/**
 * 预加载样式表
 */
export function preloadStyle(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  preloadManager.add({
    url,
    type: 'style',
    priority,
  });
}

/**
 * 预加载字体
 */
export function preloadFont(url: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  preloadManager.add({
    url,
    type: 'font',
    priority,
  });
}

/**
 * 预取数据
 */
export function preloadData(url: string, priority: 'high' | 'medium' | 'low' = 'low') {
  preloadManager.add({
    url,
    type: 'data',
    priority,
  });
}

/**
 * 预加载页面
 */
export function preloadPage(url: string, priority: 'high' | 'medium' | 'low' = 'low') {
  preloadManager.add({
    url,
    type: 'page',
    priority,
  });
}

/**
 * 批量预加载
 */
export function preloadBatch(resources: ResourceItem[]) {
  preloadManager.addBatch(resources);
}

/**
 * 智能预加载（根据用户行为预测）
 */
export function smartPreload(predictedResources: ResourceItem[]) {
  if (!shouldPreloadResources()) {
    console.log('[Preload] Skipping smart preload on low-end devices or slow networks');
    return;
  }

  preloadManager.addBatch(predictedResources);
}

/**
 * 获取预加载状态
 */
export function getPreloadStatus() {
  return preloadManager.getQueueStatus();
}
