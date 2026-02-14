import { Router } from 'express'
import UserController from '../controllers/UserController'
import { verifySupabaseToken } from '../middleware/auth'

const router = Router()

// Protected routes
router.use(verifySupabaseToken)

// Search
router.get('/search', UserController.searchUsers)

// Leaderboard
router.get('/leaderboard', UserController.getLeaderboard)

// Friends
router.get('/friends', UserController.getFriends)
router.get('/friends/requests', UserController.getPendingRequests)
router.post('/friends/request', UserController.sendFriendRequest)
router.post('/friends/accept/:id', UserController.acceptFriendRequest)
router.post('/friends/decline/:id', UserController.declineFriendRequest)
router.delete('/friends/:friendId', UserController.removeFriend)

// Push notifications
router.post('/push-token', UserController.updatePushToken)
router.delete('/push-token', UserController.deactivatePushToken)

// User by ID/username
router.get('/username/:username', UserController.getUserByUsername)
router.get('/:id/stats', UserController.getUserStats)
router.get('/:id/friends', UserController.getFriends)
router.get('/:id', UserController.getUserById)

export default router
