import { Router, Response } from 'express'
import { settingsService } from '../services/SettingsService'
import { verifySupabaseToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// All settings routes require authentication
router.use(verifySupabaseToken)

// Get user settings
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const settings = await settingsService.getUserSettings(req.userId)
  
  res.json({
    success: true,
    data: settings
  })
}))

// Update user settings
router.patch('/', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updates = req.body
  const settings = await settingsService.updateUserSettings(req.userId, updates)
  
  res.json({
    success: true,
    data: settings
  })
}))

// Get user notifications
router.get('/notifications', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit = 50, offset = 0 } = req.query
  
  const result = await settingsService.getUserNotifications(
    req.userId,
    parseInt(limit as string),
    parseInt(offset as string)
  )
  
  res.json({
    success: true,
    data: result.notifications,
    meta: {
      total: result.total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }
  })
}))

// Get unread notification count
router.get('/notifications/unread-count', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const count = await settingsService.getUnreadCount(req.userId)
  
  res.json({
    success: true,
    data: { count }
  })
}))

// Mark notification as read
router.patch('/notifications/:id/read', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const notification = await settingsService.markNotificationAsRead(req.userId, id)
  
  res.json({
    success: true,
    data: notification
  })
}))

// Mark all notifications as read
router.post('/notifications/read-all', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await settingsService.markAllNotificationsAsRead(req.userId)
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  })
}))

// Test notification
router.post('/notifications/test', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const notification = await settingsService.createNotification(req.userId, {
    type: 'test',
    title: 'Test Notification',
    body: 'This is a test notification from your settings.',
    data: { test: true }
  })
  
  res.json({
    success: true,
    data: notification,
    message: 'Test notification sent'
  })
}))

export default router
