import { Router } from 'express'
import ZoneController from '../controllers/ZoneController'
import { verifySupabaseToken } from '../middleware/auth'
import { validate, schemas } from '../middleware/validation'

const router = Router()

// Public routes (with optional auth)
router.get('/', ZoneController.getAllZones)
router.get('/nearby', ZoneController.getNearbyZones)
router.get('/:id', validate(schemas.zoneId), ZoneController.getZoneById)
router.get('/:id/leaderboard', ZoneController.getZoneLeaderboard)

// Protected routes
router.use(verifySupabaseToken)

router.post('/:id/capture', validate(schemas.zoneId), ZoneController.captureZone)
router.get('/user/my-zones', ZoneController.getUserZones)

// Admin routes (would need admin middleware in production)
router.post('/', ZoneController.createZone)
router.patch('/:id', validate(schemas.zoneId), ZoneController.updateZone)
router.delete('/:id', validate(schemas.zoneId), ZoneController.deleteZone)

export default router
