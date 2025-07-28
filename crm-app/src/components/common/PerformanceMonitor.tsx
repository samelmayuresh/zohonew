'use client';

import React, { useEffect, useState } from 'react';
import { reportWebVitals, PerformanceMonitor, addResourceHints, monitorMemoryUsage } from '@/utils/performance';

// Web Vitals reporting component
export const WebVitalsReporter: React.FC = () => {
  useEffect(() => {
    // Import and setup web vitals reporting
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    });

    // Add resource hints
    addResourceHints();
  }, []);

  return null;
};

// Performance dashboard for development
export const PerformanceDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      const monitor = PerformanceMonitor.getInstance();
      setStats(monitor.getAllStats());
      
      // Monitor memory usage
      const memory = monitorMemoryUsage();
      setMemoryInfo(memory);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !stats) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
    }}>
      <h4>Performance Monitor</h4>
      
      {memoryInfo && (
        <div>
          <strong>Memory Usage:</strong>
          <div>Used: {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
          <div>Total: {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
          <div>Usage: {memoryInfo.usagePercentage.toFixed(1)}%</div>
        </div>
      )}
      
      <div style={{ marginTop: '10px' }}>
        <strong>API Performance:</strong>
        {Object.entries(stats).map(([name, stat]: [string, any]) => (
          stat && (
            <div key={name} style={{ marginBottom: '5px' }}>
              <div>{name}:</div>
              <div style={{ marginLeft: '10px', fontSize: '11px' }}>
                Avg: {stat.avg?.toFixed(2)}ms | 
                P95: {stat.p95?.toFixed(2)}ms |
                Count: {stat.count}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// Hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      monitor.recordMetric(`component-${componentName}`, duration);
    };
  }, [componentName]);
};

