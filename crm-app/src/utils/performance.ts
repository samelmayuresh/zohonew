// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    });
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  // Record custom metrics
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get performance statistics
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  // Get all metrics
  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.recordMetric(`web-vital-${metric.name}`, metric.value);
  
  // Log slow metrics in development
  if (process.env.NODE_ENV === 'development') {
    if (metric.value > getThreshold(metric.name)) {
      console.warn(`Slow ${metric.name}:`, metric.value);
    }
  }
};

function getThreshold(name: string): number {
  const thresholds: Record<string, number> = {
    CLS: 0.1,
    FID: 100,
    FCP: 1800,
    LCP: 2500,
    TTFB: 800,
  };
  return thresholds[name] || 1000;
}

// API call performance wrapper
export const withPerformanceTracking = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T => {
  return (async (...args: any[]) => {
    const monitor = PerformanceMonitor.getInstance();
    return monitor.measureAsync(name, () => fn(...args));
  }) as T;
};

// Component render performance HOC
export const withRenderTracking = <P extends object>(
  Component: React.ComponentType<P>,
  displayName: string
) => {
  const WrappedComponent = (props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    
    React.useEffect(() => {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        monitor.recordMetric(`render-${displayName}`, duration);
      };
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withRenderTracking(${displayName})`;
  return WrappedComponent;
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    return {
      scriptCount: scripts.length,
      styleCount: styles.length,
      scripts: scripts.map(s => (s as HTMLScriptElement).src),
      styles: styles.map(s => (s as HTMLLinkElement).href),
    };
  }
  return null;
};