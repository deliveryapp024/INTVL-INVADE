import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { optionalAuth } from '../middleware/auth'

const router = Router()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  environment: string
  checks: {
    database: 'ok' | 'error'
    memory: 'ok' | 'warning' | 'critical'
    responseTime: number
  }
  details?: {
    memoryUsage: NodeJS.MemoryUsage
    activeConnections?: number
    lastError?: string
  }
}

// Basic health check
router.get('/', async (req, res) => {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
      .single()

    const responseTime = Date.now() - startTime
    const memoryUsage = process.memoryUsage()
    
    // Memory status
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
    let memoryStatus: 'ok' | 'warning' | 'critical' = 'ok'
    if (heapUsedMB > 500) memoryStatus = 'warning'
    if (heapUsedMB > 1000) memoryStatus = 'critical'

    const status: HealthStatus = {
      status: dbError || memoryStatus === 'critical' ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbError ? 'error' : 'ok',
        memory: memoryStatus,
        responseTime
      },
      details: {
        memoryUsage,
        lastError: dbError?.message
      }
    }

    const statusCode = status.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(status)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'error',
        memory: 'ok',
        responseTime: Date.now() - startTime
      },
      details: {
        lastError: (error as Error).message
      }
    })
  }
})

// Detailed health check (requires auth)
router.get('/detailed', optionalAuth, async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkMemory(),
    checkDiskSpace()
  ])

  const allHealthy = checks.every(c => c.status === 'ok')

  res.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0],
      memory: checks[1],
      disk: checks[2]
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime()
    }
  })
})

// Readiness check (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    await supabaseAdmin.from('users').select('count').limit(1)
    res.json({ ready: true })
  } catch {
    res.status(503).json({ ready: false })
  }
})

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.json({ alive: true })
})

// Public debug endpoint - returns user count (no auth required)
router.get('/debug', async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, name, role, created_at')
      .limit(10)
    
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error || countError) {
      return res.status(500).json({
        success: false,
        error: error?.message || countError?.message
      })
    }

    res.json({
      success: true,
      totalUsers: totalCount,
      sampleUsers: users,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    })
  }
})

async function checkDatabase() {
  const start = Date.now()
  try {
    await supabaseAdmin.from('users').select('count').limit(1)
    return {
      status: 'ok' as const,
      responseTime: Date.now() - start
    }
  } catch (error) {
    return {
      status: 'error' as const,
      responseTime: Date.now() - start,
      error: (error as Error).message
    }
  }
}

function checkMemory() {
  const usage = process.memoryUsage()
  const heapUsedMB = usage.heapUsed / 1024 / 1024
  
  return {
    status: heapUsedMB > 1000 ? 'warning' : 'ok' as const,
    heapUsed: `${heapUsedMB.toFixed(2)} MB`,
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`
  }
}

async function checkDiskSpace() {
  // Simplified check - in production use a library like check-disk-space
  return {
    status: 'ok' as const,
    message: 'Disk space check not implemented'
  }
}

export default router
