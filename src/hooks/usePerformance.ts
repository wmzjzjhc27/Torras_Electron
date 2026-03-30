/**
 * 性能监控 Hook
 * 
 * 功能：
 * - 组件渲染时间监控
 * - 内存使用监控
 * - 网络请求性能监控
 * - Core Web Vitals 指标收集
 */

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
}

export function usePerformance() {
  const renderTimeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    // 记录组件渲染开始时间
    const startTime = performance.now();
    
    return () => {
      // 组件卸载时计算渲染时间
      const endTime = performance.now();
      renderTimeRef.current = endTime - startTime;
      
      if (import.meta.env.DEV) {
        console.log(`[Performance] Component render time: ${renderTimeRef.current.toFixed(2)}ms`);
      }
    };
  }, []);

  useEffect(() => {
    // 收集 Core Web Vitals 指标
    const collectMetrics = async () => {
      try {
        // 动态导入 web-vitals 库（如果安装）
        // 这里使用原生 Performance API
        
        // FCP - 首次内容绘制
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        
        // LCP - 最大内容绘制（需要 PerformanceObserver）
        let lcpValue: number | undefined;
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID - 首次输入延迟
        let fidValue: number | undefined;
        const fidObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (entry.entryType === 'first-input') {
              fidValue = entry.processingStart - entry.startTime;
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // CLS - 累积布局偏移
        let clsValue: number | undefined;
        const clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue = (clsValue || 0) + entry.value;
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // 定期更新指标
        const intervalId = setInterval(() => {
          setMetrics({
            fcp: fcpEntry?.startTime,
            lcp: lcpValue,
            fid: fidValue,
            cls: clsValue,
          });
        }, 1000);
        
        return () => {
          clearInterval(intervalId);
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.error('[Performance] Error collecting metrics:', error);
      }
    };

    collectMetrics();
  }, []);

  // 获取内存使用情况（仅 Chrome/Edge 支持）
  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        usedJSHeapSize: mem.usedJSHeapSize / 1048576, // MB
        totalJSHeapSize: mem.totalJSHeapSize / 1048576, // MB
      };
    }
    return null;
  };

  // 网络请求性能监控
  const monitorNetworkRequest = (url: string, startTime: number) => {
    const duration = performance.now() - startTime;
    
    if (import.meta.env.DEV && duration > 1000) {
      console.warn(`[Performance] Slow request: ${url} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };

  return {
    metrics,
    getMemoryUsage,
    monitorNetworkRequest,
    isSlow: metrics.lcp ? metrics.lcp > 2500 : false,
  };
}
