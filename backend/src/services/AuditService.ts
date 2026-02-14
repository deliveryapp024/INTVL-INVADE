/**
 * Audit Logging Service
 * Logs all admin actions for compliance and forensics
 */

import { supabaseAdmin } from '../config/supabase'
import logger from '../utils/logger'

export type AuditAction = 
  | 'USER_VIEW'
  | 'USER_UPDATE'
  | 'USER_SUSPEND'
  | 'USER_UNSUSPEND'
  | 'USER_ANONYMIZE'
  | 'USER_EXPORT'
  | 'USER_DELETE'
  | 'RUN_VIEW'
  | 'RUN_DELETE'
  | 'ZONE_CREATE'
  | 'ZONE_UPDATE'
  | 'ZONE_DELETE'
  | 'ACHIEVEMENT_CREATE'
  | 'ACHIEVEMENT_UPDATE'
  | 'ACHIEVEMENT_DELETE'
  | 'CHALLENGE_CREATE'
  | 'CHALLENGE_UPDATE'
  | 'CHALLENGE_DELETE'
  | 'NOTIFICATION_SEND'
  | 'NOTIFICATION_SCHEDULE'
  | 'NOTIFICATION_CANCEL'
  | 'NOTIFICATION_RETRY'
  | 'NOTIFICATION_TEMPLATE_CREATED'
  | 'NOTIFICATION_TEMPLATE_UPDATED'
  | 'NOTIFICATION_TEMPLATE_DELETED'
  | 'NOTIFICATION_JOB_CREATED'
  | 'NOTIFICATION_JOB_CANCELLED'
  | 'NOTIFICATION_JOB_RETRIED'
  | 'ROLE_CHANGE'
  | 'RETENTION_RUN'
  | 'CACHE_CLEAR'
  | 'SYSTEM_CONFIG'

export interface AuditLogEntry {
  actor_user_id: string
  actor_role: string
  action: AuditAction
  entity_type: string
  entity_id?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

class AuditService {
  /**
   * Log an admin action
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('admin_audit_logs')
        .insert({
          actor_user_id: entry.actor_user_id,
          actor_role: entry.actor_role,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          metadata: entry.metadata || {},
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          created_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Failed to write audit log:', error)
      }
    } catch (error) {
      logger.error('Audit logging error:', error)
    }
  }

  /**
   * Log with request context (IP, user agent)
   */
  async logWithContext(
    req: any,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!req.user) {
      logger.warn('Attempted to audit log without user context')
      return
    }

    await this.log({
      actor_user_id: req.user.id,
      actor_role: req.user.role || 'user',
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })
  }

  /**
   * Get audit logs with filtering
   */
  async getLogs(filters: {
    actorId?: string
    action?: AuditAction
    entityType?: string
    entityId?: string
    dateFrom?: Date
    dateTo?: Date
    limit?: number
    offset?: number
  }): Promise<{ logs: any[]; total: number }> {
    let query = supabaseAdmin
      .from('admin_audit_logs')
      .select('*', { count: 'exact' })

    if (filters.actorId) {
      query = query.eq('actor_user_id', filters.actorId)
    }

    if (filters.action) {
      query = query.eq('action', filters.action)
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType)
    }

    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId)
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString())
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString())
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return { logs: data || [], total: count || 0 }
  }

  /**
   * Get recent activity for a specific admin
   */
  async getAdminActivity(
    adminId: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('admin_audit_logs')
      .select('*')
      .eq('actor_user_id', adminId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days: number = 30): Promise<{
    totalActions: number
    actionsByType: Record<string, number>
    topAdmins: Array<{ user_id: string; count: number }>
  }> {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const { data, error } = await supabaseAdmin
      .from('admin_audit_logs')
      .select('action, actor_user_id')
      .gte('created_at', dateFrom.toISOString())

    if (error) {
      throw error
    }

    const actionsByType: Record<string, number> = {}
    const adminCounts: Record<string, number> = {}

    data?.forEach((log: { action: string; actor_user_id: string }) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1
      adminCounts[log.actor_user_id] = (adminCounts[log.actor_user_id] || 0) + 1
    })

    const topAdmins = Object.entries(adminCounts)
      .map(([user_id, count]) => ({ user_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalActions: data?.length || 0,
      actionsByType,
      topAdmins
    }
  }
}

export const auditService = new AuditService()

export default auditService
