/**
 * Supabase Database Types - Shared with mobile app
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          username: string
          avatar_url: string | null
          password_hash?: string | null
          total_distance: number
          total_runs: number
          total_duration: number
          streak_days: number
          level: number
          coins: number
          is_verified: boolean
          role: 'user' | 'support' | 'admin' | 'superadmin'
          status: 'active' | 'suspended' | 'pii_anonymized'
          pii_anonymized_at: string | null
          deleted_at: string | null
          last_seen_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          username: string
          avatar_url?: string | null
          password_hash?: string | null
          total_distance?: number
          total_runs?: number
          total_duration?: number
          streak_days?: number
          level?: number
          coins?: number
          is_verified?: boolean
          role?: 'user' | 'support' | 'admin' | 'superadmin'
          status?: 'active' | 'suspended' | 'pii_anonymized'
          pii_anonymized_at?: string | null
          deleted_at?: string | null
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          username?: string
          avatar_url?: string | null
          password_hash?: string | null
          total_distance?: number
          total_runs?: number
          total_duration?: number
          streak_days?: number
          level?: number
          coins?: number
          is_verified?: boolean
          role?: 'user' | 'support' | 'admin' | 'superadmin'
          status?: 'active' | 'suspended' | 'pii_anonymized'
          pii_anonymized_at?: string | null
          deleted_at?: string | null
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      runs: {
        Row: {
          id: string
          user_id: string
          distance: number
          duration: number
          average_speed: number
          max_speed: number
          calories_burned: number
          coins_earned: number
          start_time: string
          end_time: string | null
          status: 'active' | 'paused' | 'completed' | 'abandoned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          distance?: number
          duration?: number
          average_speed?: number
          max_speed?: number
          calories_burned?: number
          coins_earned?: number
          start_time?: string
          end_time?: string | null
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          distance?: number
          duration?: number
          average_speed?: number
          max_speed?: number
          calories_burned?: number
          coins_earned?: number
          start_time?: string
          end_time?: string | null
          status?: 'active' | 'paused' | 'completed' | 'abandoned'
          created_at?: string
          updated_at?: string
        }
      }
      run_coordinates: {
        Row: {
          id: string
          run_id: string
          latitude: number
          longitude: number
          accuracy: number | null
          altitude: number | null
          speed: number | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          run_id: string
          latitude: number
          longitude: number
          accuracy?: number | null
          altitude?: number | null
          speed?: number | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          run_id?: string
          latitude?: number
          longitude?: number
          accuracy?: number | null
          altitude?: number | null
          speed?: number | null
          timestamp?: string
          created_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          name: string
          description: string | null
          center_lat: number
          center_lng: number
          radius: number
          min_level: number
          coins_reward: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          center_lat: number
          center_lng: number
          radius?: number
          min_level?: number
          coins_reward?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          center_lat?: number
          center_lng?: number
          radius?: number
          min_level?: number
          coins_reward?: number
          created_at?: string
          updated_at?: string
        }
      }
      zone_ownerships: {
        Row: {
          id: string
          zone_id: string
          user_id: string
          captured_at: string
          defended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          user_id: string
          captured_at?: string
          defended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          zone_id?: string
          user_id?: string
          captured_at?: string
          defended_at?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          icon: string
          requirement_type: 'distance' | 'runs' | 'streak' | 'zones' | 'speed'
          requirement_value: number
          coins_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon: string
          requirement_type: 'distance' | 'runs' | 'streak' | 'zones' | 'speed'
          requirement_value: number
          coins_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon?: string
          requirement_type?: 'distance' | 'runs' | 'streak' | 'zones' | 'speed'
          requirement_value?: number
          coins_reward?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          type: 'distance' | 'time' | 'speed' | 'streak'
          target_value: number
          start_date: string
          end_date: string
          coins_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'distance' | 'time' | 'speed' | 'streak'
          target_value: number
          start_date: string
          end_date: string
          coins_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'distance' | 'time' | 'speed' | 'streak'
          target_value?: number
          start_date?: string
          end_date?: string
          coins_reward?: number
          created_at?: string
        }
      }
      user_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          progress: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: 'ios' | 'android' | 'web'
          provider: 'fcm' | 'expo'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform: 'ios' | 'android' | 'web'
          provider?: 'fcm' | 'expo'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: 'ios' | 'android' | 'web'
          provider?: 'fcm' | 'expo'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_audit_logs: {
        Row: {
          id: string
          actor_user_id: string | null
          actor_role: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          actor_role?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          actor_role?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      notification_templates: {
        Row: {
          id: string
          name: string
          title_template: string
          body_template: string
          default_data: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title_template: string
          body_template: string
          default_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title_template?: string
          body_template?: string
          default_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notification_jobs: {
        Row: {
          id: string
          status: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled'
          title: string
          body: string
          image_url: string | null
          data: Json
          target_type: 'all' | 'segment' | 'specific'
          target_user_ids: string[] | null
          segment_filter: Json
          scheduled_for: string | null
          queued_at: string | null
          sent_at: string | null
          requested_count: number
          sent_count: number
          failed_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled'
          title: string
          body: string
          image_url?: string | null
          data?: Json
          target_type: 'all' | 'segment' | 'specific'
          target_user_ids?: string[] | null
          segment_filter?: Json
          scheduled_for?: string | null
          queued_at?: string | null
          sent_at?: string | null
          requested_count?: number
          sent_count?: number
          failed_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled'
          title?: string
          body?: string
          image_url?: string | null
          data?: Json
          target_type?: 'all' | 'segment' | 'specific'
          target_user_ids?: string[] | null
          segment_filter?: Json
          scheduled_for?: string | null
          queued_at?: string | null
          sent_at?: string | null
          requested_count?: number
          sent_count?: number
          failed_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notification_job_results: {
        Row: {
          id: string
          job_id: string
          user_id: string | null
          token_id: string | null
          platform: 'ios' | 'android' | null
          status: 'sent' | 'failed' | 'skipped'
          error_code: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id?: string | null
          token_id?: string | null
          platform?: 'ios' | 'android' | null
          status: 'sent' | 'failed' | 'skipped'
          error_code?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string | null
          token_id?: string | null
          platform?: 'ios' | 'android' | null
          status?: 'sent' | 'failed' | 'skipped'
          error_code?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          user_id: string | null
          session_id: string | null
          properties: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          user_id?: string | null
          session_id?: string | null
          properties?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          user_id?: string | null
          session_id?: string | null
          properties?: Json
          created_at?: string
        }
      }
      compliance_export_jobs: {
        Row: {
          id: string
          user_id: string
          status: 'requested' | 'processing' | 'ready' | 'failed' | 'expired'
          file_url: string | null
          file_size_bytes: number | null
          expires_at: string | null
          requested_by: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'requested' | 'processing' | 'ready' | 'failed' | 'expired'
          file_url?: string | null
          file_size_bytes?: number | null
          expires_at?: string | null
          requested_by?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'requested' | 'processing' | 'ready' | 'failed' | 'expired'
          file_url?: string | null
          file_size_bytes?: number | null
          expires_at?: string | null
          requested_by?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      retention_policies: {
        Row: {
          id: string
          name: string
          entity: string
          retention_days: number
          action: 'delete' | 'anonymize'
          enabled: boolean
          last_run_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          entity: string
          retention_days: number
          action?: 'delete' | 'anonymize'
          enabled?: boolean
          last_run_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          entity?: string
          retention_days?: number
          action?: 'delete' | 'anonymize'
          enabled?: boolean
          last_run_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      retention_runs: {
        Row: {
          id: string
          policy_id: string
          started_at: string
          ended_at: string | null
          affected_rows: number
          status: 'running' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          started_at: string
          ended_at?: string | null
          affected_rows?: number
          status: 'running' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          started_at?: string
          ended_at?: string | null
          affected_rows?: number
          status?: 'running' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type Run = Tables<'runs'>
export type RunCoordinate = Tables<'run_coordinates'>
export type Zone = Tables<'zones'>
export type ZoneOwnership = Tables<'zone_ownerships'>
export type Achievement = Tables<'achievements'>
export type UserAchievement = Tables<'user_achievements'>
export type Challenge = Tables<'challenges'>
export type UserChallenge = Tables<'user_challenges'>
export type Friendship = Tables<'friendships'>
export type PushToken = Tables<'push_tokens'>
export type AdminAuditLog = Tables<'admin_audit_logs'>
export type NotificationTemplate = Tables<'notification_templates'>
export type NotificationJob = Tables<'notification_jobs'>
export type NotificationJobResult = Tables<'notification_job_results'>
export type AnalyticsEvent = Tables<'analytics_events'>
export type ComplianceExportJob = Tables<'compliance_export_jobs'>
export type RetentionPolicy = Tables<'retention_policies'>
export type RetentionRun = Tables<'retention_runs'>
