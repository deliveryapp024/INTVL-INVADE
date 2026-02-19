import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

// Public debug endpoint - check database tables
router.get('/tables', async (req, res) => {
  try {
    const tables = [
      'users',
      'notification_templates',
      'notification_jobs',
      'admin_audit_logs',
      'compliance_export_jobs',
      'retention_policies'
    ]
    
    const results: any = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { exists: false, error: error.message }
        } else {
          results[table] = { exists: true, count }
        }
      } catch (e: any) {
        results[table] = { exists: false, error: e.message }
      }
    }
    
    res.json({
      success: true,
      tables: results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Check admin users endpoint directly
router.get('/admin-users', async (req, res) => {
  try {
    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('id, email, username, name, role, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      })
    }
    
    res.json({
      success: true,
      total: count,
      users,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
