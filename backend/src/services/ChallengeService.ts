import { supabaseAdmin } from '../config/supabase'
import { Challenge, UserChallenge, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'

interface ChallengeWithProgress extends Challenge {
  progress: number
  isCompleted: boolean
  completedAt: string | null
  isJoined: boolean
}

class ChallengeService {
  // Get all active challenges
  async getActiveChallenges(userId?: string): Promise<ChallengeWithProgress[]> {
    const now = new Date().toISOString()

    const { data: challenges, error } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .order('end_date', { ascending: true })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    if (!userId) {
      return (challenges || []).map(c => ({
        ...c,
        progress: 0,
        isCompleted: false,
        completedAt: null,
        isJoined: false
      }))
    }

    // Get user's progress on these challenges
    const { data: userChallenges } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challenges?.map(c => c.id) || [])

    const progressMap = new Map(userChallenges?.map(uc => [uc.challenge_id, uc]) || [])

    return (challenges || []).map(challenge => {
      const progress = progressMap.get(challenge.id)
      return {
        ...challenge,
        progress: progress?.progress || 0,
        isCompleted: progress?.is_completed || false,
        completedAt: progress?.completed_at || null,
        isJoined: !!progress
      }
    })
  }

  // Get all challenges (including past and future)
  async getAllChallenges(userId?: string): Promise<ChallengeWithProgress[]> {
    const { data: challenges, error } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    if (!userId) {
      return (challenges || []).map(c => ({
        ...c,
        progress: 0,
        isCompleted: false,
        completedAt: null,
        isJoined: false
      }))
    }

    const { data: userChallenges } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', challenges?.map(c => c.id) || [])

    const progressMap = new Map(userChallenges?.map(uc => [uc.challenge_id, uc]) || [])

    return (challenges || []).map(challenge => {
      const progress = progressMap.get(challenge.id)
      return {
        ...challenge,
        progress: progress?.progress || 0,
        isCompleted: progress?.is_completed || false,
        completedAt: progress?.completed_at || null,
        isJoined: !!progress
      }
    })
  }

  // Get challenge by ID
  async getChallengeById(challengeId: string, userId?: string): Promise<ChallengeWithProgress> {
    const { data: challenge, error } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (error || !challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    if (!userId) {
      return {
        ...challenge,
        progress: 0,
        isCompleted: false,
        completedAt: null,
        isJoined: false
      }
    }

    const { data: userChallenge } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    return {
      ...challenge,
      progress: userChallenge?.progress || 0,
      isCompleted: userChallenge?.is_completed || false,
      completedAt: userChallenge?.completed_at || null,
      isJoined: !!userChallenge
    }
  }

  // Create challenge (admin only)
  async createChallenge(data: InsertTables<'challenges'>): Promise<Challenge> {
    const { data: challenge, error } = await supabaseAdmin
      .from('challenges')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return challenge
  }

  // Update challenge (admin only)
  async updateChallenge(challengeId: string, data: Partial<Challenge>): Promise<Challenge> {
    const { data: challenge, error } = await supabaseAdmin
      .from('challenges')
      .update(data)
      .eq('id', challengeId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return challenge
  }

  // Delete challenge (admin only)
  async deleteChallenge(challengeId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('challenges')
      .delete()
      .eq('id', challengeId)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  // Join a challenge
  async joinChallenge(challengeId: string, userId: string): Promise<UserChallenge> {
    // Check if already joined
    const { data: existing } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (existing) {
      throw new AppError('Already joined this challenge', 409, 'ALREADY_JOINED')
    }

    // Check if challenge exists and is active
    const now = new Date().toISOString()
    const { data: challenge } = await supabaseAdmin
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single()

    if (!challenge) {
      throw new AppError('Challenge not found', 404, 'CHALLENGE_NOT_FOUND')
    }

    if (challenge.end_date < now) {
      throw new AppError('Challenge has ended', 400, 'CHALLENGE_ENDED')
    }

    const userChallengeData: InsertTables<'user_challenges'> = {
      user_id: userId,
      challenge_id: challengeId,
      progress: 0,
      is_completed: false,
      completed_at: null
    }

    const { data: userChallenge, error } = await supabaseAdmin
      .from('user_challenges')
      .insert(userChallengeData)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return userChallenge
  }

  // Update challenge progress
  async updateProgress(challengeId: string, userId: string, progress: number): Promise<UserChallenge> {
    const { data: userChallenge } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        *,
        challenge:challenge_id (*)
      `)
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (!userChallenge) {
      throw new AppError('Not joined to this challenge', 400, 'NOT_JOINED')
    }

    if (userChallenge.is_completed) {
      throw new AppError('Challenge already completed', 400, 'ALREADY_COMPLETED')
    }

    const challenge = userChallenge.challenge as Challenge
    const newProgress = Math.min(progress, challenge.target_value)
    const isCompleted = newProgress >= challenge.target_value

    const { data: updated, error } = await supabaseAdmin
      .from('user_challenges')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userChallenge.id)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    // Award coins if completed
    if (isCompleted && !userChallenge.is_completed) {
      await supabaseAdmin
        .from('users')
        .update({
          coins: supabaseAdmin.rpc('increment_coins', { amount: challenge.coins_reward })
        })
        .eq('id', userId)
    }

    return updated
  }

  // Get user's challenges
  async getUserChallenges(userId: string): Promise<Array<UserChallenge & { challenge: Challenge }>> {
    const { data: userChallenges, error } = await supabaseAdmin
      .from('user_challenges')
      .select(`
        *,
        challenge:challenge_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return (userChallenges || []) as Array<UserChallenge & { challenge: Challenge }>
  }

  // Get challenge leaderboard
  async getLeaderboard(challengeId: string, limit: number = 10): Promise<Array<{
    userId: string
    progress: number
    isCompleted: boolean
    completedAt: string | null
  }>> {
    const { data: userChallenges, error } = await supabaseAdmin
      .from('user_challenges')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('progress', { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return (userChallenges || []).map(uc => ({
      userId: uc.user_id,
      progress: uc.progress,
      isCompleted: uc.is_completed,
      completedAt: uc.completed_at
    }))
  }

  // Auto-join user to new challenges
  async autoJoinNewChallenges(userId: string): Promise<void> {
    const now = new Date().toISOString()

    // Get active challenges
    const { data: challenges } = await supabaseAdmin
      .from('challenges')
      .select('id')
      .lte('start_date', now)
      .gte('end_date', now)

    if (!challenges || challenges.length === 0) return

    // Get already joined challenges
    const { data: joined } = await supabaseAdmin
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', userId)

    const joinedIds = new Set(joined?.map(j => j.challenge_id) || [])

    // Join unjoined challenges
    const toJoin = challenges.filter(c => !joinedIds.has(c.id))

    for (const challenge of toJoin) {
      try {
        await this.joinChallenge(challenge.id, userId)
      } catch {
        // Ignore errors for auto-join
      }
    }
  }
}

export default new ChallengeService()
