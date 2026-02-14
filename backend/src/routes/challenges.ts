import { Router } from 'express'
import ChallengeController from '../controllers/ChallengeController'
import { verifySupabaseToken } from '../middleware/auth'

const router = Router()

// Public routes (with optional auth for progress tracking)
router.get('/', ChallengeController.getActiveChallenges)
router.get('/all', ChallengeController.getAllChallenges)
router.get('/:id', ChallengeController.getChallengeById)

// Protected routes
router.use(verifySupabaseToken)

router.post('/:id/join', ChallengeController.joinChallenge)
router.post('/:id/progress', ChallengeController.updateProgress)
router.get('/user/my-challenges', ChallengeController.getUserChallenges)
router.get('/:id/leaderboard', ChallengeController.getLeaderboard)

// Admin routes
router.post('/', ChallengeController.createChallenge)
router.patch('/:id', ChallengeController.updateChallenge)
router.delete('/:id', ChallengeController.deleteChallenge)

export default router
