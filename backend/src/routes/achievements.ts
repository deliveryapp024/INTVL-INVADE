import { Router } from 'express'
import AchievementController from '../controllers/AchievementController'
import { verifySupabaseToken } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/', AchievementController.getAllAchievements)
router.get('/stats', AchievementController.getAchievementStats)
router.get('/:id', AchievementController.getAchievementById)

// Protected routes
router.use(verifySupabaseToken)

router.post('/check', AchievementController.checkAchievements)
router.get('/user/:id', AchievementController.getUserAchievements)

// Admin routes
router.post('/', AchievementController.createAchievement)
router.patch('/:id', AchievementController.updateAchievement)
router.delete('/:id', AchievementController.deleteAchievement)

export default router
