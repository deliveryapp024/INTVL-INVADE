import { supabaseAdmin } from '../config/supabase'
import { Achievement, UserAchievement, User, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'

interface AchievementWithProgress extends Achievement {
  progress: number
  isEarned: boolean
  earnedAt: string | null
}

class AchievementService {
  // Get all achievements
  async getAllAchievements(userId?: string): Promise<AchievementWithProgress[]> {
    const { data: achievements, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('requirement_value', { ascending: true })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    if (!userId) {
      return (achievements || []).map(a => ({
        ...a,
        progress: 0,
        isEarned: false,
        earnedAt: null
      }))
    }

    // Get user's earned achievements
    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)

    const earnedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua]) || [])

    // Get user stats for progress calculation
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_distance, total_runs, streak_days, coins')
      .eq('id', userId)
      .single()

    const stats = user || { total_distance: 0, total_runs: 0, streak_days: 0, coins: 0 }

    // Calculate progress for each achievement
    return (achievements || []).map(achievement => {
      const earned = earnedMap.get(achievement.id)
      let progress = 0

      switch (achievement.requirement_type) {
        case 'distance':
          progress = Math.min(stats.total_distance / achievement.requirement_value, 1)
          break
        case 'runs':
          progress = Math.min(stats.total_runs / achievement.requirement_value, 1)
          break
        case 'streak':
          progress = Math.min(stats.streak_days / achievement.requirement_value, 1)
          break
        case 'zones':
          // Get zone capture count
          progress = 0 // Calculate separately
          break
        case 'speed':
          // Get best speed
          progress = 0 // Calculate separately
          break
      }

      return {
        ...achievement,
        progress,
        isEarned: !!earned,
        earnedAt: earned?.earned_at || null
      }
    })
  }

  // Get achievement by ID
  async getAchievementById(achievementId: string, userId?: string): Promise<AchievementWithProgress> {
    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single()

    if (error || !achievement) {
      throw new AppError('Achievement not found', 404, 'ACHIEVEMENT_NOT_FOUND')
    }

    if (!userId) {
      return {
        ...achievement,
        progress: 0,
        isEarned: false,
        earnedAt: null
      }
    }

    // Check if user has earned it
    const { data: userAchievement } = await supabaseAdmin
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single()

    // Get user stats for progress
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_distance, total_runs, streak_days')
      .eq('id', userId)
      .single()

    const stats = user || { total_distance: 0, total_runs: 0, streak_days: 0 }

    let progress = 0
    switch (achievement.requirement_type) {
      case 'distance':
        progress = Math.min(stats.total_distance / achievement.requirement_value, 1)
        break
      case 'runs':
        progress = Math.min(stats.total_runs / achievement.requirement_value, 1)
        break
      case 'streak':
        progress = Math.min(stats.streak_days / achievement.requirement_value, 1)
        break
    }

    return {
      ...achievement,
      progress,
      isEarned: !!userAchievement,
      earnedAt: userAchievement?.earned_at || null
    }
  }

  // Create achievement (admin only)
  async createAchievement(data: InsertTables<'achievements'>): Promise<Achievement> {
    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return achievement
  }

  // Update achievement (admin only)
  async updateAchievement(achievementId: string, data: Partial<Achievement>): Promise<Achievement> {
    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .update(data)
      .eq('id', achievementId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return achievement
  }

  // Delete achievement (admin only)
  async deleteAchievement(achievementId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('achievements')
      .delete()
      .eq('id', achievementId)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  // Check and award achievements for a user
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('*')

    if (!achievements) return []

    // Get user stats
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('total_distance, total_runs, streak_days')
      .eq('id', userId)
      .single()

    const stats = user || { total_distance: 0, total_runs: 0, streak_days: 0 }

    // Get already earned achievements
    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])

    // Check which achievements should be awarded
    const newAchievements: Achievement[] = []

    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue

      let shouldAward = false

      switch (achievement.requirement_type) {
        case 'distance':
          shouldAward = stats.total_distance >= achievement.requirement_value
          break
        case 'runs':
          shouldAward = stats.total_runs >= achievement.requirement_value
          break
        case 'streak':
          shouldAward = stats.streak_days >= achievement.requirement_value
          break
      }

      if (shouldAward) {
        await this.awardAchievement(userId, achievement.id)
        newAchievements.push(achievement)
      }
    }

    return newAchievements
  }

  // Award achievement to user
  private async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const userAchievementData: InsertTables<'user_achievements'> = {
      user_id: userId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('user_achievements')
      .insert(userAchievementData)

    // Get achievement reward
    const { data: achievement } = await supabaseAdmin
      .from('achievements')
      .select('coins_reward')
      .eq('id', achievementId)
      .single()

    if (achievement?.coins_reward) {
      await supabaseAdmin
        .from('users')
        .update({
          coins: supabaseAdmin.rpc('increment_coins', { amount: achievement.coins_reward })
        })
        .eq('id', userId)
    }
  }

  // Get user's earned achievements
  async getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>> {
    const { data: userAchievements, error } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        *,
        achievement:achievement_id (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return (userAchievements || []) as Array<UserAchievement & { achievement: Achievement }>
  }

  // Get achievement statistics
  async getAchievementStats(): Promise<{
    totalAchievements: number
    totalEarned: number
    mostEarned: Achievement | null
    rarest: Achievement | null
  }> {
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('*')

    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')

    if (!achievements) {
      return { totalAchievements: 0, totalEarned: 0, mostEarned: null, rarest: null }
    }

    // Count per achievement
    const counts = new Map<string, number>()
    userAchievements?.forEach(ua => {
      counts.set(ua.achievement_id, (counts.get(ua.achievement_id) || 0) + 1)
    })

    let mostEarned: Achievement | null = null
    let rarest: Achievement | null = null
    let maxCount = 0
    let minCount = Infinity

    for (const achievement of achievements) {
      const count = counts.get(achievement.id) || 0
      if (count > maxCount) {
        maxCount = count
        mostEarned = achievement
      }
      if (count < minCount) {
        minCount = count
        rarest = achievement
      }
    }

    return {
      totalAchievements: achievements.length,
      totalEarned: userAchievements?.length || 0,
      mostEarned,
      rarest
    }
  }
}

export default new AchievementService()
