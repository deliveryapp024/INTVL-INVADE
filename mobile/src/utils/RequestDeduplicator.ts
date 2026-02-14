/**
 * API Request Deduplication
 * Prevents duplicate concurrent requests to the same endpoint
 * Implements request caching with TTL
 */

import { Logger } from './Logger';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from URL and options
   */
  private getCacheKey(url: string, options?: RequestInit): string {
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${options?.method || 'GET'}-${url}-${body}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Execute request with deduplication
   */
  async fetch<T>(
    url: string,
    options?: RequestInit,
    cacheConfig?: {
      enabled?: boolean;
      ttl?: number;
      key?: string;
    }
  ): Promise<{ data: T | null; error: string | null }> {
    const cacheKey = cacheConfig?.key || this.getCacheKey(url, options);
    const method = options?.method || 'GET';

    // Check cache for GET requests
    if (cacheConfig?.enabled !== false && method === 'GET') {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        Logger.debug('API Cache HIT:', cacheKey);
        return { data: cached.data, error: null };
      }
    }

    // Check for pending request
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      // Check if pending request is not too old (30 seconds)
      if (Date.now() - pending.timestamp < 30000) {
        Logger.debug('API Deduplication: Reusing pending request', cacheKey);
        try {
          const data = await pending.promise;
          return { data, error: null };
        } catch (error) {
          return { data: null, error: (error as Error).message };
        }
      }
    }

    // Create new request
    const promise = this.executeRequest<T>(url, options);
    this.pendingRequests.set(cacheKey, {
      promise,
      timestamp: Date.now(),
    });

    try {
      const result = await promise;
      
      // Cache successful GET requests
      if (method === 'GET' && result.data && cacheConfig?.enabled !== false) {
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now(),
          ttl: cacheConfig?.ttl || this.defaultCacheTTL,
        });
      }

      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute the actual fetch request
   */
  private async executeRequest<T>(
    url: string,
    options?: RequestInit
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      Logger.debug('API Request:', options?.method || 'GET', url);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      Logger.error('API Request Failed:', (error as Error).message);
      return { data: null, error: (error as Error).message };
    }
  }

  /**
   * Invalidate cache for specific key or pattern
   */
  invalidateCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      Logger.info('API Cache: Cleared all');
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
    Logger.info('API Cache: Invalidated pattern:', pattern);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cached: this.cache.size,
      pending: this.pendingRequests.size,
    };
  }
}

export const deduplicator = new RequestDeduplicator();

/**
 * Enhanced fetch with deduplication and caching
 */
export async function smartFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackData?: T,
  cacheConfig?: {
    enabled?: boolean;
    ttl?: number;
  }
): Promise<{ data: T | null; error: string | null }> {
  const result = await deduplicator.fetch<T>(url, options, cacheConfig);
  
  if (result.error && fallbackData !== undefined) {
    Logger.warn('API Using fallback data for:', url);
    return { data: fallbackData, error: null };
  }

  return result;
}

export default deduplicator;
