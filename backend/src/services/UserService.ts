import { supabaseAdmin } from '../config/supabase'
import { User, Run, Friendship, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'

export type LeaderboardType = 'distance' | 'runs' | 'coins' | 'streak'

interface LeaderboardEntry {
  rank: number
  user: User
  value: number
  isCurrentUser: boolean
}

class UserService {
  // Get user by ID
  async getUserById(userId: string): Promise<User> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return user
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<User> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return user
  }

  // Search users
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return users || []
  }

  // Get leaderboard
  async getLeaderboard(
    type: LeaderboardType,
    options: { limit?: number; currentUserId?: string } = {}
  ): Promise<LeaderboardEntry[]> {
    const { limit = 10, currentUserId } = options

    let orderColumn: string
    switch (type) {
      case 'distance':
        orderColumn = 'total_distance'
        break
      case 'runs':
        orderColumn = 'total_runs'
        break
      case 'coins':
        orderColumn = 'coins'
        break
      case 'streak':
        orderColumn = 'streak_days'
        break
      default:
        orderColumn = 'total_distance'
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order(orderColumn, { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return (users || []).map((user, index) => ({
      rank: index + 1,
      user,
      value: user[orderColumn as keyof User] as number,
      isCurrentUser: user.id === currentUserId
    }))
  }

  // Get user's friends
  async getFriends(userId: string): Promise<User[]> {
    const { data: friendships, error } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted')

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    const friendIds = (friendships || []).map(f =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    )

    if (friendIds.length === 0) return []

    const { data: friends } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('id', friendIds)

    return friends || []
  }

  // Send friend request
  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    if (requesterId === addresseeId) {
      throw new AppError('Cannot friend yourself', 400, 'SELF_FRIEND')
    }

    // Check if friendship already exists
    const { data: existing } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
      .single()

    if (existing) {
      if (existing.status === 'accepted') {
        throw new AppError('Already friends', 409, 'ALREADY_FRIENDS')
      }
      if (existing.status === 'pending') {
        throw new AppError('Friend request already pending', 409, 'REQUEST_PENDING')
      }
      if (existing.status === 'blocked') {
        throw new AppError('User blocked', 403, 'BLOCKED')
      }
    }

    const friendshipData: InsertTables<'friendships'> = {
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending'
    }

    const { data: friendship, error } = await supabaseAdmin
      .from('friendships')
      .insert(friendshipData)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return friendship
  }

  // Accept friend request
  async acceptFriendRequest(friendshipId: string, userId: string): Promise<Friendship> {
    const { data: friendship } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .single()

    if (!friendship) {
      throw new AppError('Friend request not found', 404, 'REQUEST_NOT_FOUND')
    }

    const { data: updated, error } = await supabaseAdmin
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return updated
  }

  // Decline friend request
  async declineFriendRequest(friendshipId: string, userId: string): Promise<void> {
    const { data: friendship } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .single()

    if (!friendship) {
      throw new AppError('Friend request not found', 404, 'REQUEST_NOT_FOUND')
    }

    await supabaseAdmin
      .from('friendships')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
  }

  // Remove friend
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('friendships')
      .delete()
      .or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  // Get pending friend requests
  async getPendingRequests(userId: string): Promise<Array<Friendship & { requester: User }>> {
    const { data: requests, error } = await supabaseAdmin
      .from('friendships')
      .select(`
        *,
        requester:requester_id (*)
      `)
      .eq('addressee_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return (requests || []) as Array<Friendship & { requester: User }>
  }

  // Get user stats summary
  async getUserStats(userId: string): Promise<{
    totalDistance: number
    totalRuns: number
    totalDuration: number
    streakDays: number
    level: number
    coins: number
    achievementsCount: number
    friendsCount: number
    zonesCaptured: number
  }> {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Get counts
    const [achievementsRes, friendsRes, zonesRes] = await Promise.all([
      supabaseAdmin.from('user_achievements').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('friendships').select('id', { count: 'exact' }).or(`requester_id.eq.${userId},addressee_id.eq.${userId}`).eq('status', 'accepted'),
      supabaseAdmin.from('zone_ownerships').select('id', { count: 'exact' }).eq('user_id', userId)
    ])

    return {
      totalDistance: user.total_distance,
      totalRuns: user.total_runs,
      totalDuration: user.total_duration,
      streakDays: user.streak_days,
      level: user.level,
      coins: user.coins,
      achievementsCount: achievementsRes.count || 0,
      friendsCount: friendsRes.count || 0,
      zonesCaptured: zonesRes.count || 0
    }
  }

  // Update push token
  async updatePushToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> {
    // Check if token exists
    const { data: existing } = await supabaseAdmin
      .from('push_tokens')
      .select('id')
      .eq('token', token)
      .single()

    if (existing) {
      // Update existing
      await supabaseAdmin
        .from('push_tokens')
        .update({
          user_id: userId,
          platform,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      // Create new
      await supabaseAdmin
        .from('push_tokens')
        .insert({
          user_id: userId,
          token,
          platform,
          is_active: true
        })
    }
  }

  // Deactivate push token
  async deactivatePushToken(token: string): Promise<void> {
    await supabaseAdmin
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('token', token)
  }
}

export default new UserService()
