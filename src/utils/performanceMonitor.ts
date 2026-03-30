/**
 * 性能监控工具类
 * 
 * 功能：
 * - Core Web Vitals 指标收集
 * - 内存使用监控
 * - 网络请求性能分析
 * - 渲染性能分析
 */

export interface PerformanceReport {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  tti: number; // Time to Interactive
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceReport> = {};
  private observers: PerformanceObserver[] = [];

  /**
   * 开始监控
   */
  start() {
    console.log('[Performance] Starting performance monitoring...');
    
    this.collectFCP();
    this.collectLCP();
    this.collectFID();
    this.collectCLS();
    this.collectTTI();
    
    // 定期报告内存使用
    setInterval(() => {
      const memory = this.getMemoryUsage();
      if (memory) {
        console.log('[Performance] Memory usage:', memory);
      }
    }, 10000);
  }

  /**
   * 收集 FCP 指标
   */
  private collectFCP() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      this.metrics.fcp = fcpEntry.startTime;
      console.log('[Performance] FCP:', fcpEntry.startTime.toFixed(2), 'ms');
    } else {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          this.metrics.fcp = fcp.startTime;
          console.log('[Performance] FCP:', fcp.startTime.toFixed(2), 'ms');
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    }
  }

  /**
   * 收集 LCP 指标
   */
  private collectLCP() {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  /**
   * 收集 FID 指标
   */
  private collectFID() {
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry: any) => {
        if (entry.entryType === 'first-input') {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log('[Performance] FID:', (entry.processingStart - entry.startTime).toFixed(2), 'ms');
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  /**
   * 收集 CLS 指标
   */
  private collectCLS() {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.metrics.cls = clsValue;
      console.log('[Performance] CLS:', clsValue.toFixed(4));
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  /**
   * 收集 TTI 指标
   */
  private collectTTI() {
    // 简化的 TTI 计算：当主要网络请求和渲染完成后
    const navigationStart = performance.timing.navigationStart;
    const domInteractive = performance.timing.domInteractive;
    
    this.metrics.tti = domInteractive - navigationStart;
    console.log('[Performance] TTI:', this.metrics.tti.toFixed(2), 'ms');
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage() {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        usedJSHeapSize: Math.round(mem.usedJSHeapSize / 1048576), // MB
        totalJSHeapSize: Math.round(mem.totalJSHeapSize / 1048576), // MB
      };
    }
    return null;
  }

  /**
   * 监控网络请求
   */
  monitorNetworkRequest(url: string, startTime: number): number {
    const duration = performance.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`[Performance] ⚠️ Slow request: ${url} took ${duration.toFixed(2)}ms`);
    } else if (import.meta.env.DEV) {
      console.log(`[Performance] ✓ Request: ${url} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  /**
   * 分析组件渲染时间
   */
  analyzeComponentRender(componentName: string, renderTime: number) {
    if (renderTime > 16) {
      console.warn(`[Performance] ⚠️ ${componentName} rendered in ${renderTime.toFixed(2)}ms (>16ms)`);
    } else if (import.meta.env.DEV) {
      console.log(`[Performance] ✓ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport | null {
    if (!this.metrics.fcp || !this.metrics.lcp) {
      return null;
    }

    const report: PerformanceReport = {
      fcp: this.metrics.fcp!,
      lcp: this.metrics.lcp!,
      fid: this.metrics.fid || 0,
      cls: this.metrics.cls || 0,
      tti: this.metrics.tti || 0,
    };

    const memory = this.getMemoryUsage();
    if (memory) {
      report.memory = memory;
    }

    return report;
  }

  /**
   * 评估性能等级
   */
  evaluatePerformance(report: PerformanceReport): 'excellent' | 'good' | 'poor' {
    // Core Web Vitals 标准
    const fcpGood = report.fcp < 1800;
    const lcpGood = report.lcp < 2500;
    const fidGood = report.fid < 100;
    const clsGood = report.cls < 0.1;

    if (fcpGood && lcpGood && fidGood && clsGood) {
      return 'excellent';
    } else if (report.fcp < 3000 && report.lcp < 4000) {
      return 'good';
    } else {
      return 'poor';
    }
  }

  /**
   * 停止监控
   */
  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    console.log('[Performance] Stopped performance monitoring');
  }
}

// 单例模式
const monitor = new PerformanceMonitor();

/**
 * 启动性能监控
 */
export function startPerformanceMonitoring() {
  monitor.start();
}

/**
 * 获取性能报告
 */
export function getPerformanceReport(): PerformanceReport | null {
  return monitor.getReport();
}

/**
 * 评估当前性能
 */
export function evaluateCurrentPerformance(): 'excellent' | 'good' | 'poor' {
  const report = getPerformanceReport();
  if (!report) return 'good';
  return monitor.evaluatePerformance(report);
}

/**
 * 监控网络请求性能
 */
export function monitorRequestPerformance(url: string, startTime: number): number {
  return monitor.monitorNetworkRequest(url, startTime);
}

/**
 * 分析组件渲染性能
 */
export function analyzeRenderPerformance(componentName: string, renderTime: number): void {
  monitor.analyzeComponentRender(componentName, renderTime);
}
