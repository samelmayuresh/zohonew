import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { withPerformanceTracking } from './performance';

// Request cache for deduplication
class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  get(key: string): Promise<any> | undefined {
    return this.cache.get(key);
  }

  set(key: string, promise: Promise<any>, ttl: number = 5000): void {
    this.cache.set(key, promise);
    
    // Clear cache after TTL
    const timeout = setTimeout(() => {
      this.cache.delete(key);
      this.timeouts.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);
    
    // Also clear on promise completion
    promise.finally(() => {
      setTimeout(() => {
        this.cache.delete(key);
        const timeout = this.timeouts.get(key);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(key);
        }
      }, 1000); // Keep successful responses cached for 1 second
    });
  }

  clear(): void {
    this.cache.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

class OptimizedApiClient {
  private client: AxiosInstance;
  private requestCache = new RequestCache();
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error: any) => {
      return error.response?.status >= 500 || error.code === 'NETWORK_ERROR';
    }
  };

  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for performance tracking
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Track response time
        const duration = Date.now() - response.config.metadata?.startTime;
        if (duration > 1000) {
          console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
        }

        return response;
      },
      async (error) => {
        const config = error.config;
        
        // Handle token expiration
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry logic
        if (this.shouldRetry(error) && config._retryCount < this.retryConfig.maxRetries) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          await this.delay(this.retryConfig.retryDelay * config._retryCount);
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: any): boolean {
    return this.retryConfig.retryCondition(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  // GET with caching and deduplication
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, config?.params);
    
    // Check cache first
    const cachedRequest = this.requestCache.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }

    // Create new request
    const request = this.client.get<T>(url, config).then(response => response.data);
    
    // Cache the request
    this.requestCache.set(cacheKey, request);
    
    return request;
  }

  // POST without caching
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return response.data;
  }

  // PUT without caching
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return response.data;
  }

  // DELETE without caching
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    
    // Invalidate related cache entries
    this.invalidateCache(url);
    
    return response.data;
  }

  // Batch requests for better performance
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    const batchSize = 5; // Limit concurrent requests
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
    }
    
    return results;
  }

  // Prefetch data for better UX
  prefetch(url: string, config?: AxiosRequestConfig): void {
    this.get(url, config).catch(() => {
      // Ignore prefetch errors
    });
  }

  private invalidateCache(url: string): void {
    // Simple cache invalidation - remove entries that match the URL pattern
    const keysToDelete: string[] = [];
    
    this.requestCache['cache'].forEach((_, key) => {
      if (key.includes(url.split('?')[0])) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.requestCache['cache'].delete(key);
    });
  }

  // Clear all caches
  clearCache(): void {
    this.requestCache.clear();
  }
}

// Create singleton instance
const apiClient = new OptimizedApiClient();

// Export wrapped methods with performance tracking
export const api = {
  get: withPerformanceTracking(apiClient.get.bind(apiClient), 'api-get'),
  post: withPerformanceTracking(apiClient.post.bind(apiClient), 'api-post'),
  put: withPerformanceTracking(apiClient.put.bind(apiClient), 'api-put'),
  delete: withPerformanceTracking(apiClient.delete.bind(apiClient), 'api-delete'),
  batch: withPerformanceTracking(apiClient.batch.bind(apiClient), 'api-batch'),
  prefetch: apiClient.prefetch.bind(apiClient),
  clearCache: apiClient.clearCache.bind(apiClient),
};

export default api;