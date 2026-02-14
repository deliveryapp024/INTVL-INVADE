/**
 * Notification Routes
 * Admin endpoints for managing push notifications
 */

import { Router, Response, NextFunction } from 'express'
import { requireAdmin, requireAnyRole } from '../middleware/admin'
import { auditService } from '../services/AuditService'
import { AuthenticatedRequest } from '../types'
import { 
  scheduleNotification, 
  cancelScheduledNotification,
  retryNotificationJob,
  getNotificationQueue 
} from '../services/NotificationQueueService'
import { supabaseAdmin } from '../config/supabase'
import logger from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Apply admin middleware to all routes
router.use(requireAdmin)

/**
 * GET /api/v1/admin/notifications/templates
 * List all notification templates
 */
router.get('/templates', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { data: templates, error } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      logger.error('Failed to fetch notification templates:', error)
      res.status(500).json({ error: 'Failed to fetch templates' })
      return
    }
    
    res.json({ templates })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/templates/:id
 * Get a specific template
 */
router.get('/templates/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const { data: template, error } = await supabaseAdmin
      .from('notification_templates')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Template not found' })
        return
      }
      logger.error('Failed to fetch notification template:', error)
      res.status(500).json({ error: 'Failed to fetch template' })
      return
    }
    
    res.json({ template })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/notifications/templates
 * Create a new notification template (admin only)
 */
router.post('/templates', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, title_template, body_template, default_data } = req.body
    
    if (!name || !title_template || !body_template) {
      res.status(400).json({ 
        error: 'Missing required fields: name, title_template, body_template' 
      })
      return
    }
    
    const { data: template, error } = await supabaseAdmin
      .from('notification_templates')
      .insert({
        name,
        title_template,
        body_template,
        default_data: default_data || {},
        created_by: req.user?.id
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'Template with this name already exists' })
        return
      }
      logger.error('Failed to create notification template:', error)
      res.status(500).json({ error: 'Failed to create template' })
      return
    }
    
    auditService.logWithContext(req, 'NOTIFICATION_TEMPLATE_CREATED', 'notification_template', template.id, {
      name: template.name
    })
    
    res.status(201).json({ template })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/notifications/templates/:id
 * Update a notification template
 */
router.put('/templates/:id', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { title_template, body_template, default_data } = req.body
    
    const { data: template, error } = await supabaseAdmin
      .from('notification_templates')
      .update({
        title_template,
        body_template,
        default_data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Template not found' })
        return
      }
      logger.error('Failed to update notification template:', error)
      res.status(500).json({ error: 'Failed to update template' })
      return
    }
    
    auditService.logWithContext(req, 'NOTIFICATION_TEMPLATE_UPDATED', 'notification_template', id)
    
    res.json({ template })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/v1/admin/notifications/templates/:id
 * Delete a notification template (superadmin only)
 */
router.delete('/templates/:id', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const { error } = await supabaseAdmin
      .from('notification_templates')
      .delete()
      .eq('id', id)
    
    if (error) {
      logger.error('Failed to delete notification template:', error)
      res.status(500).json({ error: 'Failed to delete template' })
      return
    }
    
    auditService.logWithContext(req, 'NOTIFICATION_TEMPLATE_DELETED', 'notification_template', id)
    
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/jobs
 * List notification jobs with filtering
 */
router.get('/jobs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      status, 
      page = '1', 
      limit = '20',
      search 
    } = req.query
    
    let query = supabaseAdmin
      .from('notification_jobs')
      .select('*', { count: 'exact' })
    
    if (status) {
      query = query.eq('status', status as string)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
    }
    
    const from = (parseInt(page as string) - 1) * parseInt(limit as string)
    const to = from + parseInt(limit as string) - 1
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data: jobs, error, count } = await query
    
    if (error) {
      logger.error('Failed to fetch notification jobs:', error)
      res.status(500).json({ error: 'Failed to fetch jobs' })
      return
    }
    
    res.json({ 
      jobs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count || 0
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/jobs/:id
 * Get a specific notification job with results
 */
router.get('/jobs/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from('notification_jobs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (jobError) {
      if (jobError.code === 'PGRST116') {
        res.status(404).json({ error: 'Job not found' })
        return
      }
      logger.error('Failed to fetch notification job:', jobError)
      res.status(500).json({ error: 'Failed to fetch job' })
      return
    }
    
    // Get results summary
    const { data: results, error: resultsError } = await supabaseAdmin
      .from('notification_job_results')
      .select('status')
      .eq('job_id', id)
    
    if (resultsError) {
      logger.error('Failed to fetch job results:', resultsError)
    }
    
    // Calculate summary
    const summary = {
      sent: results?.filter((r: any) => r.status === 'sent').length || 0,
      failed: results?.filter((r: any) => r.status === 'failed').length || 0,
      skipped: results?.filter((r: any) => r.status === 'skipped').length || 0
    }
    
    res.json({ 
      job,
      results_summary: summary
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/notifications/jobs
 * Create and schedule a notification job
 */
router.post('/jobs', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      body,
      image_url,
      data,
      target_type,
      target_user_ids,
      segment_filter,
      scheduled_for
    } = req.body
    
    // Validate required fields
    if (!title || !body || !target_type) {
      res.status(400).json({ 
        error: 'Missing required fields: title, body, target_type' 
      })
      return
    }
    
    // Validate target
    if (target_type === 'specific' && (!target_user_ids || target_user_ids.length === 0)) {
      res.status(400).json({ error: 'target_user_ids required for specific targeting' })
      return
    }
    
    // Determine schedule
    const scheduledFor = scheduled_for ? new Date(scheduled_for) : new Date()
    const isScheduled = scheduledFor > new Date()
    
    // Create job in database
    const jobId = uuidv4()
    const { data: job, error } = await supabaseAdmin
      .from('notification_jobs')
      .insert({
        id: jobId,
        status: isScheduled ? 'scheduled' : 'queued',
        title,
        body,
        image_url,
        data: data || {},
        target_type,
        target_user_ids: target_type === 'specific' ? target_user_ids : null,
        segment_filter: target_type === 'segment' ? segment_filter : null,
        scheduled_for: scheduledFor.toISOString(),
        created_by: req.user?.id
      })
      .select()
      .single()
    
    if (error) {
      logger.error('Failed to create notification job:', error)
      res.status(500).json({ error: 'Failed to create notification job' })
      return
    }
    
    // Schedule with BullMQ
    await scheduleNotification(jobId, scheduledFor)
    
    auditService.logWithContext(req, 'NOTIFICATION_JOB_CREATED', 'notification_job', jobId, {
      title,
      target_type,
      scheduled_for: scheduledFor.toISOString()
    })
    
    res.status(201).json({ 
      job,
      message: isScheduled ? 'Notification scheduled' : 'Notification queued for immediate sending'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/notifications/jobs/:id/cancel
 * Cancel a scheduled notification job
 */
router.post('/jobs/:id/cancel', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    // Check job exists and is cancellable
    const { data: job, error } = await supabaseAdmin
      .from('notification_jobs')
      .select('status')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Job not found' })
        return
      }
      res.status(500).json({ error: 'Failed to fetch job' })
      return
    }
    
    if (!['scheduled', 'queued'].includes(job.status)) {
      res.status(400).json({ 
        error: `Cannot cancel job with status: ${job.status}` 
      })
      return
    }
    
    const cancelled = await cancelScheduledNotification(id)
    
    if (!cancelled) {
      res.status(400).json({ error: 'Failed to cancel notification job' })
      return
    }
    
    auditService.logWithContext(req, 'NOTIFICATION_JOB_CANCELLED', 'notification_job', id)
    
    res.json({ message: 'Notification job cancelled successfully' })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/notifications/jobs/:id/retry
 * Retry a failed notification job
 */
router.post('/jobs/:id/retry', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const retried = await retryNotificationJob(id)
    
    if (!retried) {
      res.status(400).json({ 
        error: 'Job not found or not in failed status' 
      })
      return
    }
    
    auditService.logWithContext(req, 'NOTIFICATION_JOB_RETRIED', 'notification_job', id)
    
    res.json({ message: 'Notification job scheduled for retry' })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/jobs/:id/results
 * Get detailed results for a notification job
 */
router.get('/jobs/:id/results', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { page = '1', limit = '50', status } = req.query
    
    let query = supabaseAdmin
      .from('notification_job_results')
      .select(`
        *,
        users:user_id (id, username, email)
      `, { count: 'exact' })
      .eq('job_id', id)
    
    if (status) {
      query = query.eq('status', status as string)
    }
    
    const from = (parseInt(page as string) - 1) * parseInt(limit as string)
    const to = from + parseInt(limit as string) - 1
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data: results, error, count } = await query
    
    if (error) {
      logger.error('Failed to fetch notification results:', error)
      res.status(500).json({ error: 'Failed to fetch results' })
      return
    }
    
    res.json({
      results,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count || 0
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/stats
 * Get notification statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { days = '30' } = req.query
    const since = new Date()
    since.setDate(since.getDate() - parseInt(days as string))
    
    // Get job counts by status
    const { data: jobStats, error: jobError } = await supabaseAdmin
      .from('notification_jobs')
      .select('status')
      .gte('created_at', since.toISOString())
    
    if (jobError) {
      logger.error('Failed to fetch job stats:', jobError)
    }
    
    // Get result counts
    const { data: resultStats, error: resultError } = await supabaseAdmin
      .from('notification_job_results')
      .select('status')
      .gte('created_at', since.toISOString())
    
    if (resultError) {
      logger.error('Failed to fetch result stats:', resultError)
    }
    
    // Calculate stats
    const stats = {
      jobs: {
        total: jobStats?.length || 0,
        scheduled: jobStats?.filter((j: any) => j.status === 'scheduled').length || 0,
        sent: jobStats?.filter((j: any) => j.status === 'sent').length || 0,
        failed: jobStats?.filter((j: any) => j.status === 'failed').length || 0,
        cancelled: jobStats?.filter((j: any) => j.status === 'cancelled').length || 0
      },
      results: {
        total: resultStats?.length || 0,
        sent: resultStats?.filter((r: any) => r.status === 'sent').length || 0,
        failed: resultStats?.filter((r: any) => r.status === 'failed').length || 0
      }
    }
    
    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/notifications/queue/status
 * Get BullMQ queue status (superadmin only)
 */
router.get('/queue/status', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const queue = getNotificationQueue()
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ])
    
    res.json({
      queue: {
        waiting,
        active,
        completed,
        failed,
        delayed
      }
    })
  } catch (error) {
    logger.error('Failed to get queue status:', error)
    res.status(500).json({ error: 'Failed to get queue status' })
  }
})

export default router
