import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import AuthService from '../services/AuthService'
import { asyncHandler } from '../middleware/errorHandler'

export class AuthController {
  // Register new user
  register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password, name, username, avatarUrl } = req.body

    const result = await AuthService.register({
      email,
      password,
      name,
      username,
      avatarUrl
    })

    res.status(201).json({
      success: true,
      data: result
    })
  })

  // Login user
  login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body

    const result = await AuthService.login({ email, password })

    res.json({
      success: true,
      data: result
    })
  })

  // Refresh tokens
  refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body

    const tokens = await AuthService.refreshToken(refreshToken)

    res.json({
      success: true,
      data: { tokens }
    })
  })

  // Get current user
  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getCurrentUser(req.userId!)

    res.json({
      success: true,
      data: { user }
    })
  })

  // Update profile
  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updates = req.body

    const user = await AuthService.updateProfile(req.userId!, updates)

    res.json({
      success: true,
      data: { user }
    })
  })

  // Change password
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body

    await AuthService.changePassword(req.userId!, currentPassword, newPassword)

    res.json({
      success: true,
      data: { message: 'Password changed successfully' }
    })
  })

  // Request password reset
  requestPasswordReset = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body

    await AuthService.requestPasswordReset(email)

    res.json({
      success: true,
      data: { message: 'Password reset email sent' }
    })
  })

  // Logout
  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logout(req.userId!)

    res.json({
      success: true,
      data: { message: 'Logged out successfully' }
    })
  })
}

export default new AuthController()
