export interface User {
  id: string
  email: string
  name: string
  username: string
  avatar_url: string | null
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
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Run {
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

export interface Zone {
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

export interface NotificationJob {
  id: string
  status: 'scheduled' | 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled'
  title: string
  body: string
  image_url: string | null
  data: Record<string, any>
  target_type: 'all' | 'segment' | 'specific'
  target_user_ids: string[] | null
  segment_filter: Record<string, any> | null
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

export interface NotificationTemplate {
  id: string
  name: string
  title_template: string
  body_template: string
  default_data: Record<string, any>
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_user_id: string | null
  actor_role: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface ComplianceExportJob {
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

export interface RetentionPolicy {
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

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: PaginationMeta
  message?: string
}
