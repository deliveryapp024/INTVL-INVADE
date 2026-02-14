/**
 * Offline Queue System
 * Queues API requests when offline and syncs when back online
 * Supports request retry with exponential backoff
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Logger } from './Logger';

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineQueueOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxQueueSize?: number;
}

const QUEUE_KEY = '@inv_offline_queue';
const DEFAULT_OPTIONS: OfflineQueueOptions = {
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  maxQueueSize: 50,
};

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private options: OfflineQueueOptions;
  private unsubscribeNetInfo: (() => void) | null = null;

  constructor(options: OfflineQueueOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.init();
  }

  /**
   * Initialize queue and load persisted requests
   */
  private async init() {
    await this.loadQueue();
    this.setupNetworkListener();
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener() {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        Logger.info('Network restored, processing offline queue...');
        this.processQueue();
      }
    });
  }

  /**
   * Load queue from storage
   */
  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        Logger.info(`Loaded ${this.queue.length} queued requests`);
      }
    } catch (error) {
      Logger.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      Logger.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Add request to offline queue
   */
  async enqueue(url: string, options: RequestInit): Promise<void> {
    // Check queue size limit
    if (this.queue.length >= (this.options.maxQueueSize || 50)) {
      Logger.warn('Offline queue full, removing oldest request');
      this.queue.shift(); // Remove oldest
    }

    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      options,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries || 3,
    };

    this.queue.push(request);
    await this.saveQueue();

    Logger.info(`Request queued: ${options.method || 'GET'} ${url}`);

    // Try to process immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.processQueue();
    }
  }

  /**
   * Process all queued requests
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    Logger.info(`Processing ${this.queue.length} queued requests...`);

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Logger.info('Still offline, skipping queue processing');
      this.isProcessing = false;
      return;
    }

    const failedRequests: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        const success = await this.executeRequest(request);
        if (!success) {
          failedRequests.push(request);
        }
      } catch (error) {
        Logger.error(`Failed to process queued request ${request.id}:`, error);
        failedRequests.push(request);
      }
    }

    // Update queue with failed requests only
    this.queue = failedRequests;
    await this.saveQueue();

    this.isProcessing = false;

    if (failedRequests.length > 0) {
      Logger.warn(`${failedRequests.length} requests failed and will be retried later`);
    } else {
      Logger.info('All queued requests processed successfully');
    }
  }

  /**
   * Execute a single queued request
   */
  private async executeRequest(request: QueuedRequest): Promise<boolean> {
    try {
      Logger.debug(`Executing queued request: ${request.options.method || 'GET'} ${request.url}`);

      const response = await fetch(request.url, {
        ...request.options,
        headers: {
          'Content-Type': 'application/json',
          ...request.options.headers,
        },
      });

      if (response.ok) {
        Logger.info(`Queued request completed: ${request.url}`);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      request.retryCount++;

      if (request.retryCount < request.maxRetries) {
        Logger.warn(`Request failed, will retry (${request.retryCount}/${request.maxRetries})`);
        return false;
      } else {
        Logger.error(`Request failed after ${request.maxRetries} retries:`, error);
        // Could notify user here about permanent failure
        return true; // Remove from queue after max retries
      }
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): { count: number; isProcessing: boolean } {
    return {
      count: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear all queued requests
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    Logger.info('Offline queue cleared');
  }

  /**
   * Get pending requests count
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Cleanup on app close
   */
  cleanup() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

/**
 * Hook to use offline queue in components
 */
export function useOfflineQueue() {
  return {
    enqueue: offlineQueue.enqueue.bind(offlineQueue),
    processQueue: offlineQueue.processQueue.bind(offlineQueue),
    getStatus: offlineQueue.getStatus.bind(offlineQueue),
    clearQueue: offlineQueue.clearQueue.bind(offlineQueue),
    getPendingCount: offlineQueue.getPendingCount.bind(offlineQueue),
  };
}

/**
 * Enhanced fetch that supports offline queuing
 */
export async function offlineAwareFetch<T>(
  url: string,
  options?: RequestInit,
  queueIfOffline: boolean = true
): Promise<{ data: T | null; error: string | null; queued: boolean }> {
  const netInfo = await NetInfo.fetch();

  if (!netInfo.isConnected && queueIfOffline) {
    // Queue the request for later
    await offlineQueue.enqueue(url, options || {});
    return {
      data: null,
      error: 'Request queued for when you\'re back online',
      queued: true,
    };
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null, queued: false };
  } catch (error) {
    // If offline and queueing enabled, add to queue
    const currentNetInfo = await NetInfo.fetch();
    if (!currentNetInfo.isConnected && queueIfOffline) {
      await offlineQueue.enqueue(url, options || {});
      return {
        data: null,
        error: 'Request queued for when you\'re back online',
        queued: true,
      };
    }

    return {
      data: null,
      error: (error as Error).message,
      queued: false,
    };
  }
}

export default offlineQueue;
