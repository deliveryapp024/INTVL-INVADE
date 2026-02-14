import { Router } from 'express'
import RunController from '../controllers/RunController'
import { verifySupabaseToken } from '../middleware/auth'
import { validate, schemas } from '../middleware/validation'

const router = Router()

// Protected routes
router.use(verifySupabaseToken)

// Run CRUD
router.post('/', RunController.createRun)
router.get('/stats', RunController.getUserStats)
router.get('/', RunController.getUserRuns)
router.get('/:id', RunController.getRunById)
router.patch('/:id', validate(schemas.updateRun), RunController.updateRun)
router.delete('/:id', RunController.deleteRun)

// Run completion
router.post('/:id/complete', RunController.completeRun)

// Coordinates
router.get('/:id/coordinates', RunController.getRunCoordinates)
router.post('/coordinates', validate(schemas.coordinate), RunController.saveCoordinate)
router.post('/coordinates/batch', RunController.saveCoordinates)

export default router
