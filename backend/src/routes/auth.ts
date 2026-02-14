import { Router } from 'express'
import AuthController from '../controllers/AuthController'
import { verifySupabaseToken } from '../middleware/auth'
import { validate, schemas } from '../middleware/validation'

const router = Router()

// Public routes
router.post('/register', validate(schemas.register), AuthController.register)
router.post('/login', validate(schemas.login), AuthController.login)
router.post('/refresh', AuthController.refreshToken)
router.post('/reset-password', AuthController.requestPasswordReset)

// Protected routes
router.get('/me', verifySupabaseToken, AuthController.getCurrentUser)
router.patch('/me', verifySupabaseToken, AuthController.updateProfile)
router.post('/change-password', verifySupabaseToken, AuthController.changePassword)
router.post('/logout', verifySupabaseToken, AuthController.logout)

export default router
