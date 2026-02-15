import { supabaseAdmin } from '../config/supabase'
import { AppError } from '../middleware/errorHandler'

export interface UserSettings {
  id?: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  profile_visible: boolean
  activity_visible: boolean
  compact_mode: boolean
  auto_refresh: boolean
  login_alerts: boolean
  suspicious_activity_alerts: boolean
  language: string
  timezone: string
  created_at?: string
  updated_at?: string
}

class SettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If no settings exist, create default settings
      if (error.code === 'PGRST116') {
        return this.createDefaultSettings(userId)
      }
      throw new AppError('Failed to fetch settings', 500, 'SETTINGS_FETCH_ERROR')
    }

    return data
  }

  // Create default settings for user
  async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      profile_visible: true,
      activity_visible: false,
      compact_mode: false,
      auto_refresh: true,
      login_alerts: true,
      suspicious_activity_alerts: true,
      language: 'en',
      timezone: 'UTC'
    }

    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to create settings', 500, 'SETTINGS_CREATE_ERROR')
    }

    return data
  }

  // Update user settings
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    // Remove fields that shouldn't be updated
    const allowedUpdates = { ...updates }
    delete allowedUpdates.id
    delete allowedUpdates.user_id
    delete allowedUpdates.created_at

    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to update settings', 500, 'SETTINGS_UPDATE_ERROR')
    }

    return data
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('user_notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new AppError('Failed to fetch notifications', 500, 'NOTIFICATIONS_FETCH_ERROR')
    }

    return {
      notifications: data || [],
      total: count || 0
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userId: string, notificationId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to mark notification as read', 500, 'NOTIFICATION_UPDATE_ERROR')
    }

    return data
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string) {
    const { error } = await supabaseAdmin
      .from('user_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      throw new AppError('Failed to mark notifications as read', 500, 'NOTIFICATIONS_UPDATE_ERROR')
    }

    return { success: true }
  }

  // Create notification
  async createNotification(userId: string, notification: {
    type: string
    title: string
    body?: string
    data?: any
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        read: false
      })
      .select()
      .single()

    if (error) {
      throw new AppError('Failed to create notification', 500, 'NOTIFICATION_CREATE_ERROR')
    }

    return data
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      return 0
    }

    return count || 0
  }
}

export const settingsService = new SettingsService()
