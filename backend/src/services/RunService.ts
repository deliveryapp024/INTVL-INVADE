import { supabaseAdmin } from '../config/supabase'
import { Run, RunCoordinate, User, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'
import {
  calculateDistance,
  calculateTotalDistance,
  calculatePace,
  calculateCalories,
  calculateCoins,
  formatDuration
} from '../utils/calculations'

interface CreateRunData {
  userId: string
  startTime?: Date
}

interface UpdateRunData {
  status?: 'active' | 'paused' | 'completed' | 'abandoned'
  endTime?: Date
}

interface CoordinateData {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  timestamp: Date
}

interface CompleteRunData {
  coordinates: CoordinateData[]
  distance?: number
  duration: number
  averageSpeed?: number
  maxSpeed?: number
  caloriesBurned?: number
}

class RunService {
  // Create a new run
  async createRun(data: CreateRunData): Promise<Run> {
    const runData: InsertTables<'runs'> = {
      user_id: data.userId,
      status: 'active',
      distance: 0,
      duration: 0,
      average_speed: 0,
      max_speed: 0,
      calories_burned: 0,
      coins_earned: 0,
      start_time: (data.startTime || new Date()).toISOString(),
      end_time: null
    }

    const { data: run, error } = await supabaseAdmin
      .from('runs')
      .insert(runData)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return run
  }

  // Get run by ID
  async getRunById(runId: string, userId?: string): Promise<Run> {
    let query = supabaseAdmin
      .from('runs')
      .select(`
        *,
        run_coordinates(*)
      `)
      .eq('id', runId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: run, error } = await query.single()

    if (error || !run) {
      throw new AppError('Run not found', 404, 'RUN_NOT_FOUND')
    }

    return run
  }

  // Update run
  async updateRun(runId: string, data: UpdateRunData, userId?: string): Promise<Run> {
    let query = supabaseAdmin
      .from('runs')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', runId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: run, error } = await query.select().single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return run
  }

  // Save coordinate for a run
  async saveCoordinate(runId: string, data: CoordinateData): Promise<RunCoordinate> {
    // Verify run exists and is active
    const { data: run } = await supabaseAdmin
      .from('runs')
      .select('status, user_id')
      .eq('id', runId)
      .single()

    if (!run) {
      throw new AppError('Run not found', 404, 'RUN_NOT_FOUND')
    }

    if (run.status !== 'active') {
      throw new AppError('Run is not active', 400, 'RUN_NOT_ACTIVE')
    }

    const coordinateData: InsertTables<'run_coordinates'> = {
      run_id: runId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy || null,
      altitude: data.altitude || null,
      speed: data.speed || null,
      timestamp: data.timestamp.toISOString()
    }

    const { data: coordinate, error } = await supabaseAdmin
      .from('run_coordinates')
      .insert(coordinateData)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return coordinate
  }

  // Save multiple coordinates
  async saveCoordinates(runId: string, coordinates: CoordinateData[]): Promise<RunCoordinate[]> {
    if (coordinates.length === 0) return []

    const coordinateData: InsertTables<'run_coordinates'>[] = coordinates.map(c => ({
      run_id: runId,
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy || null,
      altitude: c.altitude || null,
      speed: c.speed || null,
      timestamp: c.timestamp.toISOString()
    }))

    const { data, error } = await supabaseAdmin
      .from('run_coordinates')
      .insert(coordinateData)
      .select()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return data || []
  }

  // Complete a run
  async completeRun(runId: string, data: CompleteRunData): Promise<Run> {
    // Get existing run
    const { data: existingRun, error: runError } = await supabaseAdmin
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (runError || !existingRun) {
      throw new AppError('Run not found', 404, 'RUN_NOT_FOUND')
    }

    // Get all coordinates if not provided
    let distance = data.distance || 0
    let maxSpeed = data.maxSpeed || 0

    if (data.coordinates.length > 0) {
      distance = calculateTotalDistance(data.coordinates)
      maxSpeed = Math.max(...data.coordinates.map(c => c.speed || 0), 0)
    }

    const duration = data.duration
    const averageSpeed = duration > 0 ? distance / duration : 0
    const caloriesBurned = data.caloriesBurned || calculateCalories(distance, duration)
    const coinsEarned = calculateCoins(distance, averageSpeed)

    // Update run
    const { data: run, error } = await supabaseAdmin
      .from('runs')
      .update({
        distance,
        duration,
        average_speed: averageSpeed,
        max_speed: maxSpeed,
        calories_burned: caloriesBurned,
        coins_earned: coinsEarned,
        status: 'completed',
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    // Update user stats
    await this.updateUserStats(existingRun.user_id)

    return run
  }

  // Get user's runs
  async getUserRuns(
    userId: string,
    options: {
      limit?: number
      offset?: number
      status?: string
    } = {}
  ): Promise<{ runs: Run[]; total: number }> {
    const { limit = 10, offset = 0, status } = options

    let query = supabaseAdmin
      .from('runs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: runs, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return { runs: runs || [], total: count || 0 }
  }

  // Get run coordinates
  async getRunCoordinates(runId: string): Promise<RunCoordinate[]> {
    const { data: coordinates, error } = await supabaseAdmin
      .from('run_coordinates')
      .select('*')
      .eq('run_id', runId)
      .order('timestamp', { ascending: true })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return coordinates || []
  }

  // Update user stats after run completion
  private async updateUserStats(userId: string): Promise<void> {
    // Get all completed runs for user
    const { data: runs } = await supabaseAdmin
      .from('runs')
      .select('distance, duration, coins_earned, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!runs) return

    const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0)
    const totalRuns = runs.length
    const totalDuration = runs.reduce((sum, r) => sum + r.duration, 0)
    const totalCoins = runs.reduce((sum, r) => sum + r.coins_earned, 0)

    // Calculate streak
    const runDates = runs.map(r => new Date(r.created_at))
    const uniqueDates = [...new Set(runDates.map(d => d.toDateString()))]
      .map(d => new Date(d))
    
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const runDate = new Date(uniqueDates[i])
      runDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((today.getTime() - runDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streakDays) {
        streakDays++
      } else {
        break
      }
    }

    // Calculate level (1 level per 10km)
    const level = Math.floor(totalDistance / 10000) + 1

    // Update user
    await supabaseAdmin
      .from('users')
      .update({
        total_distance: totalDistance,
        total_runs: totalRuns,
        total_duration: totalDuration,
        streak_days: streakDays,
        level,
        coins: totalCoins,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }

  // Delete run
  async deleteRun(runId: string, userId?: string): Promise<void> {
    let query = supabaseAdmin
      .from('runs')
      .delete()
      .eq('id', runId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  // Get run statistics for user
  async getUserStats(userId: string): Promise<{
    totalDistance: number
    totalRuns: number
    totalDuration: number
    averagePace: number
    bestDistance: number
    longestRun: number
    currentStreak: number
  }> {
    const { data: runs } = await supabaseAdmin
      .from('runs')
      .select('distance, duration')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (!runs || runs.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        totalDuration: 0,
        averagePace: 0,
        bestDistance: 0,
        longestRun: 0,
        currentStreak: 0
      }
    }

    const totalDistance = runs.reduce((sum, r) => sum + r.distance, 0)
    const totalDuration = runs.reduce((sum, r) => sum + r.duration, 0)
    const bestDistance = Math.max(...runs.map(r => r.distance))
    const longestRun = Math.max(...runs.map(r => r.duration))
    const averagePace = calculatePace(totalDistance, totalDuration)

    return {
      totalDistance,
      totalRuns: runs.length,
      totalDuration,
      averagePace,
      bestDistance,
      longestRun,
      currentStreak: 0 // Calculate separately
    }
  }
}

export default new RunService()
