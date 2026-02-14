import { supabase } from '../lib/supabase'
import { Run, RunCoordinate, Tables } from '../types/supabase'

export interface Coordinate {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  timestamp: number
}

export interface CompleteRunData {
  runId: string
  distance: number
  duration: number
  averageSpeed: number
  maxSpeed: number
  caloriesBurned: number
  coordinates: Coordinate[]
}

class RunService {
  // Create a new run
  async createRun(userId: string): Promise<{ run: Run | null; error?: Error }> {
    try {
      const { data: run, error } = await supabase
        .from('runs')
        .insert({
          user_id: userId,
          status: 'active',
          distance: 0,
          duration: 0,
          average_speed: 0,
          max_speed: 0,
          calories_burned: 0,
          coins_earned: 0,
          start_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return { run }
    } catch (error) {
      console.error('Create run error:', error)
      return { run: null, error: error as Error }
    }
  }

  // Save a coordinate point
  async saveCoordinate(
    runId: string,
    coordinate: Coordinate
  ): Promise<{ coordinate: RunCoordinate | null; error?: Error }> {
    try {
      const { data, error } = await supabase
        .from('run_coordinates')
        .insert({
          run_id: runId,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          accuracy: coordinate.accuracy,
          altitude: coordinate.altitude,
          speed: coordinate.speed,
          timestamp: new Date(coordinate.timestamp).toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return { coordinate: data }
    } catch (error) {
      console.error('Save coordinate error:', error)
      return { coordinate: null, error: error as Error }
    }
  }

  // Save multiple coordinates
  async saveCoordinates(
    runId: string,
    coordinates: Coordinate[]
  ): Promise<{ coordinates: RunCoordinate[] | null; error?: Error }> {
    try {
      const { data, error } = await supabase
        .from('run_coordinates')
        .insert(
          coordinates.map((coord) => ({
            run_id: runId,
            latitude: coord.latitude,
            longitude: coord.longitude,
            accuracy: coord.accuracy,
            altitude: coord.altitude,
            speed: coord.speed,
            timestamp: new Date(coord.timestamp).toISOString(),
          }))
        )
        .select()

      if (error) throw error

      return { coordinates: data }
    } catch (error) {
      console.error('Save coordinates error:', error)
      return { coordinates: null, error: error as Error }
    }
  }

  // Complete a run
  async completeRun(data: CompleteRunData): Promise<{ run: Run | null; error?: Error }> {
    try {
      // Calculate coins earned (1 coin per 100m, with speed bonus)
      const speedBonus = data.averageSpeed > 3 ? 1.2 : data.averageSpeed > 4 ? 1.5 : 1
      const coinsEarned = Math.floor((data.distance / 100) * speedBonus)

      const { data: run, error } = await supabase
        .from('runs')
        .update({
          distance: data.distance,
          duration: data.duration,
          average_speed: data.averageSpeed,
          max_speed: data.maxSpeed,
          calories_burned: data.caloriesBurned,
          coins_earned: coinsEarned,
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('id', data.runId)
        .select()
        .single()

      if (error) throw error

      // Save final coordinates if any
      if (data.coordinates.length > 0) {
        await this.saveCoordinates(data.runId, data.coordinates)
      }

      return { run }
    } catch (error) {
      console.error('Complete run error:', error)
      return { run: null, error: error as Error }
    }
  }

  // Get user's runs
  async getUserRuns(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ runs: Run[]; total: number; error?: Error }> {
    try {
      const { limit = 10, offset = 0 } = options

      const { data: runs, error, count } = await supabase
        .from('runs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('start_time', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { runs: runs || [], total: count || 0 }
    } catch (error) {
      console.error('Get user runs error:', error)
      return { runs: [], total: 0, error: error as Error }
    }
  }

  // Get run details with coordinates
  async getRunDetails(runId: string): Promise<{
    run: (Run & { coordinates: RunCoordinate[] }) | null
    error?: Error
  }> {
    try {
      const { data: run, error } = await supabase
        .from('runs')
        .select(`
          *,
          run_coordinates(*)
        `)
        .eq('id', runId)
        .single()

      if (error) throw error

      return { run }
    } catch (error) {
      console.error('Get run details error:', error)
      return { run: null, error: error as Error }
    }
  }

  // Update run status
  async updateRunStatus(
    runId: string,
    status: 'active' | 'paused' | 'completed' | 'abandoned'
  ): Promise<{ run: Run | null; error?: Error }> {
    try {
      const { data: run, error } = await supabase
        .from('runs')
        .update({ status })
        .eq('id', runId)
        .select()
        .single()

      if (error) throw error

      return { run }
    } catch (error) {
      console.error('Update run status error:', error)
      return { run: null, error: error as Error }
    }
  }

  // Delete a run
  async deleteRun(runId: string): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.from('runs').delete().eq('id', runId)
      if (error) throw error
      return {}
    } catch (error) {
      console.error('Delete run error:', error)
      return { error: error as Error }
    }
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Calculate total distance from coordinates
  calculateTotalDistance(coordinates: Coordinate[]): number {
    if (coordinates.length < 2) return 0

    let totalDistance = 0
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += this.calculateDistance(
        coordinates[i - 1].latitude,
        coordinates[i - 1].longitude,
        coordinates[i].latitude,
        coordinates[i].longitude
      )
    }
    return totalDistance
  }
}

export default new RunService()
