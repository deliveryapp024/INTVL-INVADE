import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'
import { supabaseAdmin } from '../config/supabase'
import { AppError } from './errorHandler'

// List of admin user IDs - in production, this should be in database
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // Check if user email is in admin list
    if (!ADMIN_EMAILS.includes(req.user.email)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin access required' }
      })
      return
    }

    next()
  } catch (error) {
    next(new AppError('Admin check failed', 500, 'ADMIN_CHECK_FAILED'))
  }
}

// Alternative: Check admin role in database
export const requireAdminRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      })
      return
    }

    // Check user metadata for admin role
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(req.userId)
    
    if (user.user?.user_metadata?.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin role required' }
      })
      return
    }

    next()
  } catch (error) {
    next(new AppError('Admin role check failed', 500, 'ADMIN_CHECK_FAILED'))
  }
}
