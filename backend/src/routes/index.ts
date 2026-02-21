import { Router } from 'express'
import authRoutes from './auth'
import userRoutes from './users'
import runRoutes from './runs'
import zoneRoutes from './zones'
import achievementRoutes from './achievements'
import challengeRoutes from './challenges'
import webhookRoutes from './webhooks'
import adminRoutes from './admin'
import adminNotificationRoutes from './admin-notifications'
import adminComplianceRoutes from './admin-compliance'
import settingsRoutes from './settings'
import bootstrapRoutes from './bootstrap'

const router = Router()

// Public bootstrap route (one-time setup)
router.use('/bootstrap', bootstrapRoutes)

// API routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/runs', runRoutes)
router.use('/zones', zoneRoutes)
router.use('/achievements', achievementRoutes)
router.use('/challenges', challengeRoutes)
router.use('/webhooks', webhookRoutes)
router.use('/admin', adminRoutes)
router.use('/admin/notifications', adminNotificationRoutes)
router.use('/admin/compliance', adminComplianceRoutes)
router.use('/settings', settingsRoutes)

export default router
