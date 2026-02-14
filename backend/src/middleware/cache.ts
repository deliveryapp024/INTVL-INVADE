import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'

interface CacheEntry {
  data: any
  expiresAt: number
}

// Simple in-memory cache
// In production, use Redis
class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: any, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expiresAt })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const memoryCache = new MemoryCache()

// Cache middleware
export const cache = (ttlSeconds: number = 300) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Skip cache for authenticated requests that modify data
    if (req.method !== 'GET') {
      next()
      return
    }

    const cacheKey = `${req.method}:${req.originalUrl}:${req.userId || 'anon'}`
    const cached = memoryCache.get(cacheKey)

    if (cached) {
      res.setHeader('X-Cache', 'HIT')
      res.json(cached)
      return
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res)
    res.json = (data: any) => {
      if (res.statusCode === 200) {
        memoryCache.set(cacheKey, data, ttlSeconds * 1000)
        res.setHeader('X-Cache', 'MISS')
        res.setHeader('Cache-Control', `max-age=${ttlSeconds}`)
      }
      return originalJson(data)
    }

    next()
  }
}

// Invalidate cache by pattern
export const invalidateCache = (pattern: string): void => {
  for (const key of memoryCache.getStats().keys) {
    if (key.includes(pattern)) {
      memoryCache.delete(key)
    }
  }
}

// Cache tags for grouped invalidation
export const cacheTags = {
  user: (userId: string) => `user:${userId}`,
  runs: (userId: string) => `runs:${userId}`,
  zones: () => 'zones',
  achievements: () => 'achievements',
  challenges: () => 'challenges',
  leaderboard: () => 'leaderboard'
}
