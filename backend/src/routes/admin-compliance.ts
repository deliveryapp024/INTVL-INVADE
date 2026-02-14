/**
 * Compliance Routes
 * Admin endpoints for GDPR/data compliance operations
 */

import { Router, Response, NextFunction } from 'express'
import { requireAdmin, requireAnyRole } from '../middleware/admin'
import { auditService } from '../services/AuditService'
import { AuthenticatedRequest } from '../types'
import { supabaseAdmin } from '../config/supabase'
import logger from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Apply admin middleware to all routes
router.use(requireAdmin)

/**
 * GET /api/v1/admin/compliance/export-jobs
 * List data export jobs (DSAR requests)
 */
router.get('/export-jobs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      status, 
      page = '1', 
      limit = '20',
      user_id 
    } = req.query
    
    let query = supabaseAdmin
      .from('compliance_export_jobs')
      .select(`
        *,
        users:user_id (id, email, username),
        requester:requested_by (id, email, username)
      `, { count: 'exact' })
    
    if (status) {
      query = query.eq('status', status as string)
    }
    
    if (user_id) {
      query = query.eq('user_id', user_id as string)
    }
    
    const from = (parseInt(page as string) - 1) * parseInt(limit as string)
    const to = from + parseInt(limit as string) - 1
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data: jobs, error, count } = await query
    
    if (error) {
      logger.error('Failed to fetch export jobs:', error)
      res.status(500).json({ error: 'Failed to fetch export jobs' })
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
 * POST /api/v1/admin/compliance/export-jobs
 * Create a new data export job for a user
 */
router.post('/export-jobs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.body
    
    if (!user_id) {
      res.status(400).json({ error: 'user_id is required' })
      return
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', user_id)
      .single()
    
    if (userError || !user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    
    // Check if there's already an active export for this user
    const { data: existing } = await supabaseAdmin
      .from('compliance_export_jobs')
      .select('id')
      .eq('user_id', user_id)
      .in('status', ['requested', 'processing'])
      .single()
    
    if (existing) {
      res.status(409).json({ 
        error: 'An export job is already in progress for this user',
        job_id: existing.id
      })
      return
    }
    
    // Create export job
    const jobId = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry
    
    const { data: job, error } = await supabaseAdmin
      .from('compliance_export_jobs')
      .insert({
        id: jobId,
        user_id,
        status: 'requested',
        requested_by: req.user?.id,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()
    
    if (error) {
      logger.error('Failed to create export job:', error)
      res.status(500).json({ error: 'Failed to create export job' })
      return
    }
    
    auditService.logWithContext(req, 'USER_EXPORT', 'compliance_export', jobId, {
      user_id,
      user_email: user.email
    })
    
    res.status(201).json({ 
      job,
      message: 'Export job created. Processing will begin shortly.'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/compliance/export-jobs/:id
 * Get details of a specific export job
 */
router.get('/export-jobs/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const { data: job, error } = await supabaseAdmin
      .from('compliance_export_jobs')
      .select(`
        *,
        users:user_id (id, email, username, name),
        requester:requested_by (id, email, username)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Export job not found' })
        return
      }
      logger.error('Failed to fetch export job:', error)
      res.status(500).json({ error: 'Failed to fetch export job' })
      return
    }
    
    res.json({ job })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/compliance/export-jobs/:id/process
 * Trigger processing of an export job (admin only)
 */
router.post('/export-jobs/:id/process', requireAnyRole(['admin', 'superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    // Get job details
    const { data: job, error } = await supabaseAdmin
      .from('compliance_export_jobs')
      .select('*, users:user_id (email)')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Export job not found' })
        return
      }
      res.status(500).json({ error: 'Failed to fetch export job' })
      return
    }
    
    if (job.status !== 'requested') {
      res.status(400).json({ error: `Cannot process job with status: ${job.status}` })
      return
    }
    
    // Update status to processing
    await supabaseAdmin
      .from('compliance_export_jobs')
      .update({ status: 'processing' })
      .eq('id', id)
    
    // Note: Actual data export processing would be done by a background worker
    // This endpoint just triggers the process
    
    auditService.logWithContext(req, 'USER_EXPORT', 'compliance_export', id, {
      action: 'process_triggered',
      user_email: job.users?.email
    })
    
    res.json({ 
      message: 'Export job processing triggered',
      job_id: id
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/compliance/retention-policies
 * List all retention policies
 */
router.get('/retention-policies', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { data: policies, error } = await supabaseAdmin
      .from('retention_policies')
      .select(`
        *,
        created_by_user:created_by (id, email, username)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      logger.error('Failed to fetch retention policies:', error)
      res.status(500).json({ error: 'Failed to fetch retention policies' })
      return
    }
    
    res.json({ policies })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/admin/compliance/retention-policies
 * Create a new retention policy (superadmin only)
 */
router.post('/retention-policies', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, entity, retention_days, action } = req.body
    
    if (!name || !entity || !retention_days) {
      res.status(400).json({ 
        error: 'Missing required fields: name, entity, retention_days' 
      })
      return
    }
    
    const { data: policy, error } = await supabaseAdmin
      .from('retention_policies')
      .insert({
        name,
        entity,
        retention_days,
        action: action || 'delete',
        created_by: req.user?.id
      })
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'Policy with this name already exists' })
        return
      }
      logger.error('Failed to create retention policy:', error)
      res.status(500).json({ error: 'Failed to create retention policy' })
      return
    }
    
    auditService.logWithContext(req, 'RETENTION_RUN', 'retention_policy', policy.id, {
      name,
      entity,
      retention_days
    })
    
    res.status(201).json({ policy })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/v1/admin/compliance/retention-policies/:id
 * Update a retention policy (superadmin only)
 */
router.put('/retention-policies/:id', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { retention_days, action, enabled } = req.body
    
    const updateData: any = {}
    if (retention_days !== undefined) updateData.retention_days = retention_days
    if (action !== undefined) updateData.action = action
    if (enabled !== undefined) updateData.enabled = enabled
    updateData.updated_at = new Date().toISOString()
    
    const { data: policy, error } = await supabaseAdmin
      .from('retention_policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Retention policy not found' })
        return
      }
      logger.error('Failed to update retention policy:', error)
      res.status(500).json({ error: 'Failed to update retention policy' })
      return
    }
    
    auditService.logWithContext(req, 'RETENTION_RUN', 'retention_policy', id, {
      action: 'updated',
      changes: updateData
    })
    
    res.json({ policy })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/v1/admin/compliance/retention-policies/:id
 * Delete a retention policy (superadmin only)
 */
router.delete('/retention-policies/:id', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    
    const { error } = await supabaseAdmin
      .from('retention_policies')
      .delete()
      .eq('id', id)
    
    if (error) {
      logger.error('Failed to delete retention policy:', error)
      res.status(500).json({ error: 'Failed to delete retention policy' })
      return
    }
    
    auditService.logWithContext(req, 'RETENTION_RUN', 'retention_policy', id, {
      action: 'deleted'
    })
    
    res.json({ message: 'Retention policy deleted successfully' })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/compliance/retention-runs
 * List retention policy execution runs
 */
router.get('/retention-runs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      policy_id,
      page = '1', 
      limit = '20'
    } = req.query
    
    let query = supabaseAdmin
      .from('retention_runs')
      .select(`
        *,
        policy:policy_id (name, entity)
      `, { count: 'exact' })
    
    if (policy_id) {
      query = query.eq('policy_id', policy_id as string)
    }
    
    const from = (parseInt(page as string) - 1) * parseInt(limit as string)
    const to = from + parseInt(limit as string) - 1
    
    query = query
      .order('started_at', { ascending: false })
      .range(from, to)
    
    const { data: runs, error, count } = await query
    
    if (error) {
      logger.error('Failed to fetch retention runs:', error)
      res.status(500).json({ error: 'Failed to fetch retention runs' })
      return
    }
    
    res.json({ 
      runs,
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
 * POST /api/v1/admin/compliance/retention-runs
 * Trigger a retention policy run (superadmin only)
 */
router.post('/retention-runs', requireAnyRole(['superadmin']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { policy_id } = req.body
    
    if (!policy_id) {
      res.status(400).json({ error: 'policy_id is required' })
      return
    }
    
    // Get policy details
    const { data: policy, error: policyError } = await supabaseAdmin
      .from('retention_policies')
      .select('*')
      .eq('id', policy_id)
      .single()
    
    if (policyError || !policy) {
      res.status(404).json({ error: 'Retention policy not found' })
      return
    }
    
    if (!policy.enabled) {
      res.status(400).json({ error: 'Retention policy is disabled' })
      return
    }
    
    // Create run record
    const runId = uuidv4()
    const { data: run, error } = await supabaseAdmin
      .from('retention_runs')
      .insert({
        id: runId,
        policy_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      logger.error('Failed to create retention run:', error)
      res.status(500).json({ error: 'Failed to create retention run' })
      return
    }
    
    // Update policy last_run_at
    await supabaseAdmin
      .from('retention_policies')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', policy_id)
    
    auditService.logWithContext(req, 'RETENTION_RUN', 'retention_run', runId, {
      policy_id,
      policy_name: policy.name,
      entity: policy.entity
    })
    
    // Note: Actual data deletion would be done by a background worker
    // This endpoint just creates the run record and triggers the process
    
    res.status(201).json({ 
      run,
      message: 'Retention run started. Data cleanup will be performed by background worker.'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/admin/compliance/stats
 * Get compliance statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get export job stats
    const { data: exportJobs } = await supabaseAdmin
      .from('compliance_export_jobs')
      .select('status')
    
    // Get retention policy stats
    const { data: policies } = await supabaseAdmin
      .from('retention_policies')
      .select('enabled')
    
    // Get retention run stats
    const { data: runs } = await supabaseAdmin
      .from('retention_runs')
      .select('status, affected_rows')
    
    const stats = {
      exports: {
        total: exportJobs?.length || 0,
        requested: exportJobs?.filter((j: any) => j.status === 'requested').length || 0,
        processing: exportJobs?.filter((j: any) => j.status === 'processing').length || 0,
        ready: exportJobs?.filter((j: any) => j.status === 'ready').length || 0,
        failed: exportJobs?.filter((j: any) => j.status === 'failed').length || 0
      },
      retention: {
        policies: policies?.length || 0,
        enabled: policies?.filter((p: any) => p.enabled).length || 0,
        runs: runs?.length || 0,
        total_rows_affected: runs?.reduce((sum: number, r: any) => sum + (r.affected_rows || 0), 0) || 0
      }
    }
    
    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

export default router
