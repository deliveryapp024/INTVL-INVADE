import { Request } from 'express'
import { User, Zone, Achievement, Challenge, Friendship } from './database'

// Extended Express Request with user info
export interface AuthenticatedRequest extends Request {
  user?: User
  userId?: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  hasMore?: boolean
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Filters
export interface DateRangeFilter {
  from?: Date
  to?: Date
}

export interface LocationFilter {
  lat: number
  lng: number
  radius: number
}

// Run-related types
export interface RunStats {
  totalDistance: number
  totalRuns: number
  totalDuration: number
  averagePace: number
  bestDistance: number
  bestDuration: number
  currentStreak: number
  longestStreak: number
}

export interface Coordinate {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  timestamp: Date | string
}

export interface RunData {
  id?: string
  userId: string
  coordinates: Coordinate[]
  distance: number
  duration: number
  averageSpeed: number
  maxSpeed: number
  caloriesBurned: number
  startTime: Date | string
  endTime?: Date | string
  status: 'active' | 'paused' | 'completed' | 'abandoned'
}

// Zone-related types
export interface ZoneCapture {
  zoneId: string
  userId: string
  capturedAt: Date
}

export interface ZoneWithOwnership extends Zone {
  currentOwner?: User
  capturedAt?: string
  isOwnedByUser: boolean
}

// Achievement types
export interface AchievementWithProgress extends Achievement {
  progress: number
  isEarned: boolean
  earnedAt?: string
}

// Challenge types
export interface ChallengeWithProgress extends Challenge {
  progress: number
  isCompleted: boolean
  completedAt?: string
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  user: User
  value: number
  isCurrentUser: boolean
}

export type LeaderboardType = 'distance' | 'runs' | 'coins' | 'streak'

// Notification types
export interface NotificationData {
  type: 'achievement' | 'challenge' | 'friend_request' | 'zone_capture' | 'system'
  title: string
  body: string
  data?: Record<string, unknown>
}

// Friendship types
export interface FriendshipWithUsers extends Friendship {
  requester: User
  addressee: User
}

// Socket events
export interface ServerToClientEvents {
  'run:update': (data: { runId: string; distance: number; duration: number }) => void
  'zone:captured': (data: { zoneId: string; userId: string; userName: string }) => void
  'friend:request': (data: { from: User }) => void
  'notification': (data: NotificationData) => void
}

export interface ClientToServerEvents {
  'run:start': (data: { userId: string }) => void
  'run:stop': (data: { runId: string }) => void
  'location:update': (data: { lat: number; lng: number }) => void
  'join:zone': (zoneId: string) => void
  'leave:zone': (zoneId: string) => void
}

// Re-export database types
export * from './database'
