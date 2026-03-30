/**
 * 懒加载图片组件
 * 
 * 特性：
 * - Intersection Observer API 实现懒加载
 * - 加载占位图
 * - 加载失败处理
 * - 渐进式图片加载
 * - 响应式图片质量
 * - 设备性能自适应
 */

import { useState, useEffect, useRef, memo } from 'react';
import { getImageQuality } from '@/utils/performance';

interface LazyImageProps {
  src: string;
  alt?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  onLoad?: () => void;
  onError?: () => void;
  quality?: 'low' | 'medium' | 'high'; // 手动指定图片质量
  priority?: boolean; // 是否优先加载（不延迟）
}

export const LazyImage = memo(function LazyImage({
  src,
  alt = '',
  placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  className = '',
  style,
  width,
  height,
  onLoad,
  onError,
  quality,
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 根据设备性能自动选择图片质量
  const autoQuality = quality || getImageQuality();
  
  // 生成优化后的图片 URL（如果后端支持）
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return originalSrc;
    
    // 这里可以根据实际后端服务添加图片优化逻辑
    // 例如：Cloudinary, Imgix 等
    switch (autoQuality) {
      case 'low':
        // 可以添加压缩参数
        return originalSrc + '?quality=low';
      case 'medium':
        return originalSrc + '?quality=medium';
      case 'high':
        return originalSrc;
      default:
        return originalSrc;
    }
  };

  useEffect(() => {
    // 如果是优先加载，直接加载
    if (priority) {
      setIsInView(true);
      return;
    }

    // 使用 Intersection Observer 检测元素是否在视口内
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <img
      ref={imgRef}
      src={isInView && !error ? getOptimizedSrc(src) : placeholder}
      alt={alt}
      className={`${className} ${!isLoaded ? 'image-loading' : 'image-loaded'}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
});
