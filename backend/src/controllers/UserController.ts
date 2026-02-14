import { Response } from 'express'
import { AuthenticatedRequest, LeaderboardType } from '../types'
import UserService from '../services/UserService'
import { asyncHandler } from '../middleware/errorHandler'

export class UserController {
  // Get user by ID
  getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const user = await UserService.getUserById(id)

    res.json({
      success: true,
      data: { user }
    })
  })

  // Get user by username
  getUserByUsername = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { username } = req.params

    const user = await UserService.getUserByUsername(username)

    res.json({
      success: true,
      data: { user }
    })
  })

  // Search users
  searchUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q, limit = 20 } = req.query

    if (!q) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_QUERY', message: 'Search query required' }
      })
      return
    }

    const users = await UserService.searchUsers(q as string, parseInt(limit as string, 10))

    res.json({
      success: true,
      data: { users }
    })
  })

  // Get leaderboard
  getLeaderboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { type = 'distance', limit = 10 } = req.query

    const leaderboard = await UserService.getLeaderboard(type as LeaderboardType, {
      limit: parseInt(limit as string, 10),
      currentUserId: req.userId
    })

    res.json({
      success: true,
      data: { leaderboard }
    })
  })

  // Get user's friends
  getFriends = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const friends = await UserService.getFriends(id)

    res.json({
      success: true,
      data: { friends }
    })
  })

  // Send friend request
  sendFriendRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.body

    const friendship = await UserService.sendFriendRequest(req.userId!, userId)

    res.status(201).json({
      success: true,
      data: { friendship }
    })
  })

  // Accept friend request
  acceptFriendRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const friendship = await UserService.acceptFriendRequest(id, req.userId!)

    res.json({
      success: true,
      data: { friendship }
    })
  })

  // Decline friend request
  declineFriendRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    await UserService.declineFriendRequest(id, req.userId!)

    res.json({
      success: true,
      data: { message: 'Friend request declined' }
    })
  })

  // Remove friend
  removeFriend = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { friendId } = req.params

    await UserService.removeFriend(req.userId!, friendId)

    res.json({
      success: true,
      data: { message: 'Friend removed' }
    })
  })

  // Get pending friend requests
  getPendingRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const requests = await UserService.getPendingRequests(req.userId!)

    res.json({
      success: true,
      data: { requests }
    })
  })

  // Get user stats
  getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const stats = await UserService.getUserStats(id)

    res.json({
      success: true,
      data: { stats }
    })
  })

  // Update push token
  updatePushToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { token, platform } = req.body

    await UserService.updatePushToken(req.userId!, token, platform)

    res.json({
      success: true,
      data: { message: 'Push token updated' }
    })
  })

  // Deactivate push token
  deactivatePushToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.body

    await UserService.deactivatePushToken(token)

    res.json({
      success: true,
      data: { message: 'Push token deactivated' }
    })
  })
}

export default new UserController()
