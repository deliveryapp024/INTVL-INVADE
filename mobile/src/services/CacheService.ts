/**
 * Cache Service
 * Image caching, data caching, and memory management
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const CacheService = {
  // In-memory cache
  memoryCache: new Map<string, any>(),

  /**
   * Set cache with expiration
   */
  async set<T>(key: string, data: T, ttlMinutes: number = 60): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Persist to AsyncStorage for larger data
    try {
      await AsyncStorage.setItem(`@cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.log('Cache storage error:', error);
    }
  },

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory first
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    // Check AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(`@cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (entry.expiresAt > Date.now()) {
          // Restore to memory
          this.memoryCache.set(key, entry);
          return entry.data;
        }
        // Expired, remove it
        await AsyncStorage.removeItem(`@cache_${key}`);
      }
    } catch (error) {
      console.log('Cache retrieval error:', error);
    }

    return null;
  },

  /**
   * Remove cached item
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(`@cache_${key}`);
    } catch (error) {
      console.log('Cache removal error:', error);
    }
  },

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.log('Cache clear error:', error);
    }
  },

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
      return cacheKeys.length;
    } catch {
      return 0;
    }
  },

  // ============== IMAGE CACHING ==============

  /**
   * Cache image from URL
   */
  async cacheImage(url: string): Promise<string | null> {
    try {
      const filename = url.split('/').pop() || 'image';
      const cacheDir = (FileSystem as any).cacheDirectory + 'images/';
      const localUri = cacheDir + filename;

      // Check if already cached
      const exists = await FileSystem.getInfoAsync(localUri);
      if (exists.exists) {
        return localUri;
      }

      // Create directory if needed
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

      // Download image
      await FileSystem.downloadAsync(url, localUri);
      return localUri;
    } catch (error) {
      console.log('Image cache error:', error);
      return url; // Fallback to original URL
    }
  },

  /**
   * Get cached image path
   */
  async getCachedImage(url: string): Promise<string> {
    const cached = await this.get<string>(`img_${url}`);
    if (cached) {
      const exists = await FileSystem.getInfoAsync(cached);
      if (exists.exists) {
        return cached;
      }
    }
    return url;
  },

  /**
   * Clear image cache
   */
  async clearImageCache(): Promise<void> {
    try {
      const cacheDir = (FileSystem as any).cacheDirectory + 'images/';
      await FileSystem.deleteAsync(cacheDir, { idempotent: true });
    } catch (error) {
      console.log('Clear image cache error:', error);
    }
  },

  // ============== API RESPONSE CACHING ==============

  /**
   * Cache API response
   */
  async cacheApiResponse<T>(endpoint: string, data: T, ttlMinutes: number = 15): Promise<void> {
    await this.set(`api_${endpoint}`, data, ttlMinutes);
  },

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(endpoint: string): Promise<T | null> {
    return await this.get<T>(`api_${endpoint}`);
  },

  /**
   * Invalidate API cache
   */
  async invalidateApiCache(pattern?: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const apiKeys = keys.filter(key => key.startsWith('@cache_api_'));
      
      if (pattern) {
        const matchingKeys = apiKeys.filter(key => key.includes(pattern));
        await AsyncStorage.multiRemove(matchingKeys);
      } else {
        await AsyncStorage.multiRemove(apiKeys);
      }
    } catch (error) {
      console.log('Invalidate cache error:', error);
    }
  },

  // ============== MEMORY MANAGEMENT ==============

  /**
   * Clear memory cache (call when app goes to background)
   */
  clearMemoryCache(): void {
    this.memoryCache.clear();
  },

  /**
   * Trim memory cache to max size
   */
  trimMemoryCache(maxSize: number = 50): void {
    if (this.memoryCache.size > maxSize) {
      const entriesToDelete = this.memoryCache.size - maxSize;
      const keys = Array.from(this.memoryCache.keys()).slice(0, entriesToDelete);
      keys.forEach(key => this.memoryCache.delete(key));
    }
  },
};

export default CacheService;
