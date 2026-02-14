import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'
import { AppError } from './errorHandler'

// Role hierarchy for permission checking
export type UserRole = 'user' | 'support' | 'admin' | 'superadmin'

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  support: 1,
  admin: 2,
  superadmin: 3
}

// Check if a role has sufficient permissions
const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Legacy support for env-based admin list (for bootstrap)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

// Main RBAC middleware factory
export const requireRole = (minRole: UserRole) => {
  return async (
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

      const userRole = req.user.role as UserRole || 'user'

      // Check role hierarchy
      if (!hasRole(userRole, minRole)) {
        res.status(403).json({
          success: false,
          error: { 
            code: 'FORBIDDEN', 
            message: `${minRole} role required. You have ${userRole}.`
          }
        })
        return
      }

      next()
    } catch (error) {
      next(new AppError('Role check failed', 500, 'ROLE_CHECK_FAILED'))
    }
  }
}

// Require any of the specified roles
export const requireAnyRole = (roles: UserRole[]) => {
  return async (
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

      const userRole = req.user.role as UserRole || 'user'

      if (!roles.includes(userRole)) {
        res.status(403).json({
          success: false,
          error: { 
            code: 'FORBIDDEN', 
            message: `One of [${roles.join(', ')}] roles required. You have ${userRole}.`
          }
        })
        return
      }

      next()
    } catch (error) {
      next(new AppError('Role check failed', 500, 'ROLE_CHECK_FAILED'))
    }
  }
}

// Convenience middlewares
export const requireSupport = requireRole('support')
export const requireAdmin = requireRole('admin')
export const requireSuperadmin = requireRole('superadmin')

// Require support OR admin OR superadmin (read-only access)
export const requireStaff = requireAnyRole(['support', 'admin', 'superadmin'])

// Legacy middleware for backward compatibility (uses email allowlist)
export const requireAdminLegacy = async (
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
