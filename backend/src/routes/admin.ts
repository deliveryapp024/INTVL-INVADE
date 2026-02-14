import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { verifySupabaseToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { asyncHandler } from '../middleware/errorHandler'
import { memoryCache } from '../middleware/cache'
import { metrics } from '../middleware/metrics'

const router = Router()

// All admin routes require authentication and admin role
router.use(verifySupabaseToken)
router.use(requireAdmin)

// Get system stats
router.get('/stats', asyncHandler(async (req, res) => {
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

// Get recent users
router.get('/users', asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query

  const { data: users, error, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)

  if (error) throw error

  res.json({
    success: true,
    data: users,
    meta: { total: count, limit, offset }
  })
}))

// Get user details
router.get('/users/:id', asyncHandler(async (req, res) => {
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

  res.json({
    success: true,
    data: { user }
  })
}))

// Delete user
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  // Delete from auth
  await supabaseAdmin.auth.admin.deleteUser(id)

  // Delete from database (cascade will handle relations)
  await supabaseAdmin.from('users').delete().eq('id', id)

  res.json({
    success: true,
    data: { message: 'User deleted successfully' }
  })
}))

// Clear cache
router.post('/cache/clear', asyncHandler(async (req, res) => {
  memoryCache.clear()

  res.json({
    success: true,
    data: { message: 'Cache cleared successfully' }
  })
}))

// Get system logs (last 100)
router.get('/logs', asyncHandler(async (req, res) => {
  // In production, integrate with your logging service
  // For now, return a placeholder
  res.json({
    success: true,
    data: {
      message: 'Logs endpoint - integrate with Winston, CloudWatch, or ELK'
    }
  })
}))

// Database backup trigger
router.post('/backup', asyncHandler(async (req, res) => {
  // In production, trigger your backup mechanism
  // This could be a Supabase backup, or custom export
  res.json({
    success: true,
    data: {
      message: 'Backup triggered',
      timestamp: new Date().toISOString()
    }
  })
}))

// Feature flags management
router.get('/features', asyncHandler(async (req, res) => {
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

router.patch('/features/:name', asyncHandler(async (req, res) => {
  const { name } = req.params
  const { enabled } = req.body

  // In production, store in database or config service
  // For now, just acknowledge
  res.json({
    success: true,
    data: {
      message: `Feature ${name} ${enabled ? 'enabled' : 'disabled'}`,
      note: 'In production, persist this to database'
    }
  })
}))

export default router
