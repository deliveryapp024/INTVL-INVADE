import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import AchievementService from '../services/AchievementService'
import { asyncHandler } from '../middleware/errorHandler'

export class AchievementController {
  // Get all achievements
  getAllAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const achievements = await AchievementService.getAllAchievements(req.userId)

    res.json({
      success: true,
      data: { achievements }
    })
  })

  // Get achievement by ID
  getAchievementById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const achievement = await AchievementService.getAchievementById(id, req.userId)

    res.json({
      success: true,
      data: { achievement }
    })
  })

  // Create achievement (admin)
  createAchievement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const achievement = await AchievementService.createAchievement(req.body)

    res.status(201).json({
      success: true,
      data: { achievement }
    })
  })

  // Update achievement (admin)
  updateAchievement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const achievement = await AchievementService.updateAchievement(id, req.body)

    res.json({
      success: true,
      data: { achievement }
    })
  })

  // Delete achievement (admin)
  deleteAchievement = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    await AchievementService.deleteAchievement(id)

    res.json({
      success: true,
      data: { message: 'Achievement deleted successfully' }
    })
  })

  // Check and award achievements
  checkAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const newAchievements = await AchievementService.checkAchievements(req.userId!)

    res.json({
      success: true,
      data: { newAchievements }
    })
  })

  // Get user's earned achievements
  getUserAchievements = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const achievements = await AchievementService.getUserAchievements(id)

    res.json({
      success: true,
      data: { achievements }
    })
  })

  // Get achievement statistics
  getAchievementStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await AchievementService.getAchievementStats()

    res.json({
      success: true,
      data: { stats }
    })
  })
}

export default new AchievementController()
