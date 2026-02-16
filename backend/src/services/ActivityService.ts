import { supabaseAdmin } from '../config/supabase'
import { AppError } from '../middleware/errorHandler'

export interface ActivityItem {
  id: string
  user_id: string | null
  actor_name: string
  actor_email: string
  actor_avatar_url: string | null
  action_type: string
  action_description: string
  entity_type: string | null
  entity_id: string | null
  metadata: any
  created_at: string
}

class ActivityService {
  // Get recent activity feed
  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError('Failed to fetch activity feed', 500, 'ACTIVITY_FETCH_ERROR')
    }

    return data || []
  }

  // Get activity by type
  async getActivityByType(actionType: string, limit: number = 10): Promise<ActivityItem[]> {
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .select('*')
      .eq('action_type', actionType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError('Failed to fetch activity by type', 500, 'ACTIVITY_FETCH_ERROR')
    }

    return data || []
  }

  // Create activity entry
  async createActivity(activity: Omit<ActivityItem, 'id' | 'created_at'>): Promise<ActivityItem> {
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .insert(activity)
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to create activity', 500, 'ACTIVITY_CREATE_ERROR')
    }

    return data
  }

  // Get activity stats
  async getActivityStats(days: number = 7): Promise<{
    total: number
    by_type: Record<string, number>
    by_day: Record<string, number>
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .select('*')
      .gte('created_at', startDate.toISOString())

    if (error) {
      throw new AppError('Failed to fetch activity stats', 500, 'ACTIVITY_STATS_ERROR')
    }

    const activities = data || []

    // Calculate stats
    const byType: Record<string, number> = {}
    const byDay: Record<string, number> = {}

    activities.forEach(activity => {
      // Count by type
      byType[activity.action_type] = (byType[activity.action_type] || 0) + 1

      // Count by day
      const day = new Date(activity.created_at).toISOString().split('T')[0]
      byDay[day] = (byDay[day] || 0) + 1
    })

    return {
      total: activities.length,
      by_type: byType,
      by_day: byDay
    }
  }
}

export const activityService = new ActivityService()
