import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import ChallengeService from '../services/ChallengeService'
import { asyncHandler } from '../middleware/errorHandler'

export class ChallengeController {
  // Get all active challenges
  getActiveChallenges = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const challenges = await ChallengeService.getActiveChallenges(req.userId)

    res.json({
      success: true,
      data: { challenges }
    })
  })

  // Get all challenges (including past and future)
  getAllChallenges = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const challenges = await ChallengeService.getAllChallenges(req.userId)

    res.json({
      success: true,
      data: { challenges }
    })
  })

  // Get challenge by ID
  getChallengeById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const challenge = await ChallengeService.getChallengeById(id, req.userId)

    res.json({
      success: true,
      data: { challenge }
    })
  })

  // Create challenge (admin)
  createChallenge = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const challenge = await ChallengeService.createChallenge(req.body)

    res.status(201).json({
      success: true,
      data: { challenge }
    })
  })

  // Update challenge (admin)
  updateChallenge = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const challenge = await ChallengeService.updateChallenge(id, req.body)

    res.json({
      success: true,
      data: { challenge }
    })
  })

  // Delete challenge (admin)
  deleteChallenge = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    await ChallengeService.deleteChallenge(id)

    res.json({
      success: true,
      data: { message: 'Challenge deleted successfully' }
    })
  })

  // Join challenge
  joinChallenge = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const userChallenge = await ChallengeService.joinChallenge(id, req.userId!)

    res.status(201).json({
      success: true,
      data: { userChallenge }
    })
  })

  // Update challenge progress
  updateProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { progress } = req.body

    const userChallenge = await ChallengeService.updateProgress(id, req.userId!, progress)

    res.json({
      success: true,
      data: { userChallenge }
    })
  })

  // Get user's challenges
  getUserChallenges = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const challenges = await ChallengeService.getUserChallenges(req.userId!)

    res.json({
      success: true,
      data: { challenges }
    })
  })

  // Get challenge leaderboard
  getLeaderboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { limit = 10 } = req.query

    const leaderboard = await ChallengeService.getLeaderboard(
      id,
      parseInt(limit as string, 10)
    )

    res.json({
      success: true,
      data: { leaderboard }
    })
  })
}

export default new ChallengeController()
