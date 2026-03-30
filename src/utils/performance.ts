/**
 * 设备性能检测与降级策略
 * 
 * 功能：
 * - 检测设备类型（低端/中端/高端）
 * - 自动降级复杂动画
 * - 优化资源加载策略
 */

export interface DevicePerformance {
  isLowEnd: boolean;
  isMidRange: boolean;
  isHighEnd: boolean;
  deviceMemory?: number;
  hardwareConcurrency: number;
  connectionSpeed?: 'slow' | 'moderate' | 'fast';
  prefersReducedMotion: boolean;
}

class PerformanceDetector {
  private performance: DevicePerformance | null = null;

  /**
   * 检测设备性能
   */
  detect(): DevicePerformance {
    if (this.performance) {
      return this.performance;
    }

    // 设备内存（仅 Chrome/Edge 支持）
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // CPU 核心数
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // 网络连接速度
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';
    
    // 用户偏好减少动画
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 综合评分
    let score = 0;
    
    // 内存评分 (0-3 分)
    if (deviceMemory >= 8) score += 3;
    else if (deviceMemory >= 6) score += 2;
    else if (deviceMemory >= 4) score += 1;
    
    // CPU 评分 (0-3 分)
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else score += 1;
    
    // 网络评分 (0-2 分)
    if (effectiveType === '4g') score += 2;
    else if (effectiveType === '3g') score += 1;
    
    // 判断设备等级
    const isLowEnd = score <= 3;
    const isMidRange = score > 3 && score <= 5;
    const isHighEnd = score > 5;

    this.performance = {
      isLowEnd,
      isMidRange,
      isHighEnd,
      deviceMemory,
      hardwareConcurrency,
      connectionSpeed: effectiveType === '4g' ? 'fast' : effectiveType === '3g' ? 'moderate' : 'slow',
      prefersReducedMotion,
    };

    console.log('[Performance] Device detection result:', this.performance);
    
    return this.performance;
  }

  /**
   * 是否启用复杂动画
   */
  shouldEnableComplexAnimations(): boolean {
    const perf = this.detect();
    return !perf.isLowEnd && !perf.prefersReducedMotion;
  }

  /**
   * 是否启用 GPU 加速
   */
  shouldEnableGPUAcceleration(): boolean {
    const perf = this.detect();
    return perf.isHighEnd || perf.isMidRange;
  }

  /**
   * 是否预加载资源
   */
  shouldPreloadResources(): boolean {
    const perf = this.detect();
    return perf.isHighEnd && perf.connectionSpeed === 'fast';
  }

  /**
   * 获取图片质量等级
   */
  getImageQuality(): 'low' | 'medium' | 'high' {
    const perf = this.detect();
    
    if (perf.isLowEnd || perf.connectionSpeed === 'slow') {
      return 'low';
    } else if (perf.isMidRange) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * 获取并发请求数限制
   */
  getMaxConcurrentRequests(): number {
    const perf = this.detect();
    
    if (perf.isLowEnd) {
      return 2;
    } else if (perf.isMidRange) {
      return 4;
    } else {
      return 8;
    }
  }
}

// 单例模式
const detector = new PerformanceDetector();

/**
 * 获取设备性能信息
 */
export function getDevicePerformance(): DevicePerformance {
  return detector.detect();
}

/**
 * 是否应该启用复杂动画
 */
export function shouldEnableAnimations(): boolean {
  return detector.shouldEnableComplexAnimations();
}

/**
 * 是否应该启用 GPU 加速
 */
export function shouldEnableGPUAcceleration(): boolean {
  return detector.shouldEnableGPUAcceleration();
}

/**
 * 是否应该预加载资源
 */
export function shouldPreloadResources(): boolean {
  return detector.shouldPreloadResources();
}

/**
 * 获取推荐的图片质量
 */
export function getImageQuality(): 'low' | 'medium' | 'high' {
  return detector.getImageQuality();
}

/**
 * 获取最大并发请求数
 */
export function getMaxConcurrentRequests(): number {
  return detector.getMaxConcurrentRequests();
}
