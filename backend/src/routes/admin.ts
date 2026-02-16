import { Router, Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { verifySupabaseToken } from '../middleware/auth'
import { requireAdmin, requireSuperadmin, requireStaff } from '../middleware/admin'
import { asyncHandler } from '../middleware/errorHandler'
import { memoryCache } from '../middleware/cache'
import { metrics } from '../middleware/metrics'
import { auditService } from '../services/AuditService'
import { activityService } from '../services/ActivityService'
import { AuthenticatedRequest } from '../types'

const router = Router()

// All admin routes require authentication
router.use(verifySupabaseToken)

// ============================================
// ROLE MANAGEMENT (Superadmin only)
// ============================================

// List all staff users (support/admin/superadmin)
router.get('/roles/users', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { query, role, limit = 50, offset = 0 } = req.query

  let dbQuery = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .in('role', ['support', 'admin', 'superadmin'])
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`email.ilike.%${query}%,username.ilike.%${query}%,name.ilike.%${query}%`)
  }

  if (role) {
    dbQuery = dbQuery.eq('role', role)
  }

  const { data, error, count } = await dbQuery
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_VIEW',
    'users',
    undefined,
    { action: 'list_staff', filters: { query, role } }
  )

  res.json({
    success: true,
    data,
    meta: { total: count, limit, offset }
  })
}))

// Update user role (Superadmin only)
router.patch('/roles/users/:id', requireSuperadmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const { role, status } = req.body

  // Get current user for audit
  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('role, status')
    .eq('id', id)
    .single()

  const updates: any = {}
  if (role) updates.role = role
  if (status) updates.status = status

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'ROLE_CHANGE',
    'users',
    id,
    {
      previous: { role: currentUser?.role, status: currentUser?.status },
      current: updates
    }
  )

  res.json({
    success: true,
    data: { user: data, message: 'User role updated successfully' }
  })
}))

// ============================================
// USERS MANAGEMENT (Support+ read, Admin+ write)
// ============================================

// Get all users with filters (Support+)
router.get('/users', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    limit = 50, 
    offset = 0, 
    query,
    role,
    status,
    minLevel,
    maxLevel,
    lastSeenDays
  } = req.query

  let dbQuery = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.or(`email.ilike.%${query}%,username.ilike.%${query}%,name.ilike.%${query}%`)
  }

  if (role) {
    dbQuery = dbQuery.eq('role', role)
  }

  if (status) {
    dbQuery = dbQuery.eq('status', status)
  }

  if (minLevel) {
    dbQuery = dbQuery.gte('level', parseInt(minLevel as string))
  }

  if (maxLevel) {
    dbQuery = dbQuery.lte('level', parseInt(maxLevel as string))
  }

  if (lastSeenDays) {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - parseInt(lastSeenDays as string))
    dbQuery = dbQuery.gte('last_seen_at', dateFrom.toISOString())
  }

  const { data, error, count } = await dbQuery
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_VIEW',
    'users',
    undefined,
    { action: 'list', filters: { query, role, status } }
  )

  res.json({
    success: true,
    data,
    meta: { total: count, limit, offset }
  })
}))

// Get user details (Support+)
router.get('/users/:id', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      runs(*),
      zone_ownerships(*),
      user_achievements(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_VIEW',
    'users',
    id
  )

  res.json({
    success: true,
    data: { user }
  })
}))

// Update user (Admin+)
router.patch('/users/:id', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const updates = req.body

  // Get current data for audit
  const { data: currentUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_UPDATE',
    'users',
    id,
    { previous: currentUser, updates }
  )

  res.json({
    success: true,
    data: { user: data, message: 'User updated successfully' }
  })
}))

// Suspend user (Admin+)
router.post('/users/:id/suspend', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const { reason } = req.body

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ status: 'suspended' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_SUSPEND',
    'users',
    id,
    { reason }
  )

  res.json({
    success: true,
    data: { user: data, message: 'User suspended successfully' }
  })
}))

// Unsuspend user (Admin+)
router.post('/users/:id/unsuspend', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_UNSUSPEND',
    'users',
    id
  )

  res.json({
    success: true,
    data: { user: data, message: 'User unsuspended successfully' }
  })
}))

// Anonymize user PII (Superadmin)
router.post('/users/:id/anonymize', requireSuperadmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const { reason } = req.body

  // Get current user data
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  // Anonymize PII
  const anonymizedData = {
    email: `deleted+${id}@example.invalid`,
    name: 'Deleted User',
    username: `deleted_${id.slice(0, 8)}`,
    avatar_url: null,
    status: 'pii_anonymized',
    pii_anonymized_at: new Date().toISOString()
  }

  // Deactivate all push tokens
  await supabaseAdmin
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', id)

  // Update user
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(anonymizedData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_ANONYMIZE',
    'users',
    id,
    { reason, original_email: user?.email }
  )

  res.json({
    success: true,
    data: { user: data, message: 'User PII anonymized successfully' }
  })
}))

// Request data export (Admin+)
router.post('/users/:id/export', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  // Create export job
  const { data: job, error } = await supabaseAdmin
    .from('compliance_export_jobs')
    .insert({
      user_id: id,
      status: 'requested',
      requested_by: req.user?.id
    })
    .select()
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'USER_EXPORT',
    'users',
    id,
    { job_id: job.id }
  )

  res.json({
    success: true,
    data: { job, message: 'Export job created' }
  })
}))

// ============================================
// RUNS MANAGEMENT (Support+ read, Admin+ write)
// ============================================

// Get runs list (Support+)
router.get('/runs', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    limit = 50,
    offset = 0,
    userId,
    status,
    dateFrom,
    dateTo,
    minDistance,
    maxDistance
  } = req.query

  let dbQuery = supabaseAdmin
    .from('runs')
    .select(`
      *,
      users!inner(id, username, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (userId) {
    dbQuery = dbQuery.eq('user_id', userId)
  }

  if (status) {
    dbQuery = dbQuery.eq('status', status)
  }

  if (dateFrom) {
    dbQuery = dbQuery.gte('created_at', dateFrom)
  }

  if (dateTo) {
    dbQuery = dbQuery.lte('created_at', dateTo)
  }

  if (minDistance) {
    dbQuery = dbQuery.gte('distance', parseInt(minDistance as string))
  }

  if (maxDistance) {
    dbQuery = dbQuery.lte('distance', parseInt(maxDistance as string))
  }

  const { data, error, count } = await dbQuery
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

  if (error) throw error

  await auditService.logWithContext(
    req,
    'RUN_VIEW',
    'runs',
    undefined,
    { filters: { userId, status } }
  )

  res.json({
    success: true,
    data,
    meta: { total: count, limit, offset }
  })
}))

// Get run details (Support+)
router.get('/runs/:id', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  const { data: run, error } = await supabaseAdmin
    .from('runs')
    .select(`
      *,
      users!inner(id, username, email),
      run_coordinates(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  await auditService.logWithContext(
    req,
    'RUN_VIEW',
    'runs',
    id
  )

  res.json({
    success: true,
    data: { run }
  })
}))

// Delete run (Admin+)
router.delete('/runs/:id', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params

  await auditService.logWithContext(
    req,
    'RUN_DELETE',
    'runs',
    id
  )

  const { error } = await supabaseAdmin
    .from('runs')
    .delete()
    .eq('id', id)

  if (error) throw error

  res.json({
    success: true,
    data: { message: 'Run deleted successfully' }
  })
}))

// ============================================
// AUDIT LOGS (Admin+)
// ============================================

// Get audit logs (Admin+)
router.get('/audit-logs', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    actorId,
    action,
    entityType,
    entityId,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0
  } = req.query

  const { logs, total } = await auditService.getLogs({
    actorId: actorId as string,
    action: action as any,
    entityType: entityType as string,
    entityId: entityId as string,
    dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
    dateTo: dateTo ? new Date(dateTo as string) : undefined,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  })

  res.json({
    success: true,
    data: logs,
    meta: { total, limit, offset }
  })
}))

// Get activity stats (Admin+)
router.get('/audit-logs/stats', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { days = 30 } = req.query

  const stats = await auditService.getActivityStats(parseInt(days as string))

  res.json({
    success: true,
    data: stats
  })
}))

// ============================================
// SYSTEM (Admin+)
// ============================================

// Get system stats
router.get('/stats', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    { count: usersCount },
    { count: runsCount },
    { count: zonesCount },
    { count: achievementsCount }
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('runs').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('zones').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('achievements').select('*', { count: 'exact', head: true })
  ])

  res.json({
    success: true,
    data: {
      users: usersCount || 0,
      runs: runsCount || 0,
      zones: zonesCount || 0,
      achievements: achievementsCount || 0,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: memoryCache.getStats(),
      metrics: metrics.getMetrics()
    }
  })
}))

// Clear cache (Admin+)
router.post('/cache/clear', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  memoryCache.clear()

  await auditService.logWithContext(
    req,
    'CACHE_CLEAR',
    'system'
  )

  res.json({
    success: true,
    data: { message: 'Cache cleared successfully' }
  })
}))

// Feature flags management (Admin+)
router.get('/features', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      features: {
        realTime: process.env.ENABLE_REAL_TIME === 'true',
        pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
        analytics: process.env.ENABLE_ANALYTICS === 'true',
        newZones: process.env.ENABLE_NEW_ZONES === 'true'
      }
    }
  })
}))

router.patch('/features/:name', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.params
  const { enabled } = req.body

  // In production, store in database
  await auditService.logWithContext(
    req,
    'SYSTEM_CONFIG',
    'features',
    name,
    { enabled }
  )

  res.json({
    success: true,
    data: {
      message: `Feature ${name} ${enabled ? 'enabled' : 'disabled'}`,
      note: 'In production, persist this to database'
    }
  })
}))

// ============================================
// ACTIVITY FEED (Admin+)
// ============================================

// Get recent activity feed
router.get('/activity', requireStaff, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit = 10 } = req.query

  const activities = await activityService.getRecentActivity(parseInt(limit as string))

  res.json({
    success: true,
    data: activities
  })
}))

// Get activity stats
router.get('/activity/stats', requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { days = 7 } = req.query

  const stats = await activityService.getActivityStats(parseInt(days as string))

  res.json({
    success: true,
    data: stats
  })
}))

export default router
