/**
 * Performance Monitor
 * Tracks render times, FPS, and component performance metrics
 * Helps identify performance bottlenecks in production
 */

import { useRef, useEffect, useCallback } from 'react';
import { InteractionManager, Platform } from 'react-native';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
  mountTime: number;
  averageRenderTime: number;
  lastRenderTimestamp: number;
}

interface FPSMetrics {
  currentFPS: number;
  averageFPS: number;
  droppedFrames: number;
  totalFrames: number;
}

class PerformanceMonitorClass {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private fpsMetrics: FPSMetrics = {
    currentFPS: 60,
    averageFPS: 60,
    droppedFrames: 0,
    totalFrames: 0,
  };
  private fpsFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private isTrackingFPS: boolean = false;

  /**
   * Track component render performance
   */
  trackRender(componentName: string, startTime: number): void {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const existing = this.metrics.get(componentName);
    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const totalRenderTime = (existing.averageRenderTime * existing.renderCount) + renderTime;
      
      this.metrics.set(componentName, {
        ...existing,
        renderCount: newRenderCount,
        renderTime,
        averageRenderTime: totalRenderTime / newRenderCount,
        lastRenderTimestamp: endTime,
      });
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        mountTime: endTime,
        averageRenderTime: renderTime,
        lastRenderTimestamp: endTime,
      });
    }

    // Log slow renders (> 16ms for 60fps, > 33ms for 30fps)
    if (renderTime > 16) {
      console.warn(`⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Track component mount time
   */
  trackMount(componentName: string, startTime: number): void {
    const endTime = performance.now();
    const mountTime = endTime - startTime;
    
    const existing = this.metrics.get(componentName);
    if (existing) {
      existing.mountTime = mountTime;
    } else {
      this.metrics.set(componentName, {
        componentName,
        renderTime: 0,
        renderCount: 0,
        mountTime,
        averageRenderTime: 0,
        lastRenderTimestamp: endTime,
      });
    }

    if (mountTime > 100) {
      console.warn(`⚠️ Slow mount detected: ${componentName} took ${mountTime.toFixed(2)}ms`);
    }
  }

  /**
   * Start FPS tracking
   */
  startFPSTracking(): void {
    if (this.isTrackingFPS || Platform.OS === 'web') return;
    
    this.isTrackingFPS = true;
    this.lastFrameTime = performance.now();
    
    const trackFrame = () => {
      if (!this.isTrackingFPS) return;
      
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      
      // Calculate FPS
      const fps = Math.round(1000 / delta);
      this.fpsMetrics.currentFPS = fps;
      this.fpsMetrics.totalFrames++;
      
      // Track dropped frames (less than 55fps)
      if (fps < 55) {
        this.fpsMetrics.droppedFrames++;
      }
      
      // Update average FPS
      this.fpsMetrics.averageFPS = 
        ((this.fpsMetrics.averageFPS * (this.fpsMetrics.totalFrames - 1)) + fps) / 
        this.fpsMetrics.totalFrames;
      
      // Warn about very low FPS
      if (fps < 30) {
        console.warn(`⚠️ Very low FPS: ${fps}`);
      }
      
      this.fpsFrameId = requestAnimationFrame(trackFrame);
    };
    
    this.fpsFrameId = requestAnimationFrame(trackFrame);
  }

  /**
   * Stop FPS tracking
   */
  stopFPSTracking(): void {
    this.isTrackingFPS = false;
    if (this.fpsFrameId !== null) {
      cancelAnimationFrame(this.fpsFrameId);
      this.fpsFrameId = null;
    }
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get FPS metrics
   */
  getFPSMetrics(): FPSMetrics {
    return { ...this.fpsMetrics };
  }

  /**
   * Get slowest components
   */
  getSlowestComponents(count: number = 5): PerformanceMetrics[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, count);
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const slowest = this.getSlowestComponents();
    const fps = this.fpsMetrics;
    
    let report = '\n📊 PERFORMANCE REPORT\n';
    report += '====================\n\n';
    
    report += '🎮 FPS Metrics:\n';
    report += `  Current: ${fps.currentFPS} FPS\n`;
    report += `  Average: ${fps.averageFPS.toFixed(1)} FPS\n`;
    report += `  Dropped: ${fps.droppedFrames} frames\n\n`;
    
    report += '🐌 Slowest Components:\n';
    slowest.forEach((metric, index) => {
      report += `  ${index + 1}. ${metric.componentName}\n`;
      report += `     Avg: ${metric.averageRenderTime.toFixed(2)}ms | `;
      report += `Renders: ${metric.renderCount}\n`;
    });
    
    return report;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.fpsMetrics = {
      currentFPS: 60,
      averageFPS: 60,
      droppedFrames: 0,
      totalFrames: 0,
    };
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    console.log(this.getReport());
  }
}

// Singleton instance
export const PerformanceMonitor = new PerformanceMonitorClass();

/**
 * React Hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string, enabled: boolean = true) {
  const renderStartTime = useRef<number>(0);
  const mountStartTime = useRef<number>(performance.now());

  useEffect(() => {
    if (!enabled) return;
    
    // Track mount time
    const mountTime = performance.now();
    PerformanceMonitor.trackMount(componentName, mountStartTime.current);
    
    return () => {
      // Cleanup if needed
    };
  }, [componentName, enabled]);

  // Track render
  if (enabled) {
    renderStartTime.current = performance.now();
  }

  useEffect(() => {
    if (!enabled) return;
    
    // Track render time after commit
    PerformanceMonitor.trackRender(componentName, renderStartTime.current);
  });
}

/**
 * Hook to measure interaction time
 */
export function useInteractionTiming(callback: () => void, delay: number = 0) {
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      if (delay > 0) {
        setTimeout(callback, delay);
      } else {
        callback();
      }
    });
    
    return () => handle.cancel();
  }, [callback, delay]);
}

/**
 * Hook to track expensive operations
 */
export function useExpensiveOperationTracker(operationName: string) {
  const startTime = useRef<number>(0);
  
  const startTracking = useCallback(() => {
    startTime.current = performance.now();
  }, []);
  
  const endTracking = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    if (duration > 100) {
      console.warn(`⚠️ Expensive operation: ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [operationName]);
  
  return { startTracking, endTracking };
}

export default PerformanceMonitor;
