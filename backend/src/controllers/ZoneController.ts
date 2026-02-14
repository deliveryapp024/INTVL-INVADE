import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import ZoneService from '../services/ZoneService'
import { asyncHandler } from '../middleware/errorHandler'

export class ZoneController {
  // Get all zones
  getAllZones = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const zones = await ZoneService.getAllZones(req.userId)

    res.json({
      success: true,
      data: { zones }
    })
  })

  // Get zone by ID
  getZoneById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const zone = await ZoneService.getZoneById(id, req.userId)

    res.json({
      success: true,
      data: { zone }
    })
  })

  // Create zone (admin)
  createZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const zone = await ZoneService.createZone(req.body)

    res.status(201).json({
      success: true,
      data: { zone }
    })
  })

  // Update zone (admin)
  updateZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const zone = await ZoneService.updateZone(id, req.body)

    res.json({
      success: true,
      data: { zone }
    })
  })

  // Delete zone (admin)
  deleteZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    await ZoneService.deleteZone(id)

    res.json({
      success: true,
      data: { message: 'Zone deleted successfully' }
    })
  })

  // Capture zone
  captureZone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { latitude, longitude } = req.body

    const result = await ZoneService.captureZone({
      zoneId: id,
      userId: req.userId!,
      userLocation: { latitude, longitude }
    })

    res.json({
      success: true,
      data: result
    })
  })

  // Get user's zones
  getUserZones = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const zones = await ZoneService.getUserZones(req.userId!)

    res.json({
      success: true,
      data: { zones }
    })
  })

  // Get nearby zones
  getNearbyZones = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { lat, lng, radius = 5000 } = req.query

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_PARAMS', message: 'Latitude and longitude required' }
      })
      return
    }

    const zones = await ZoneService.getNearbyZones(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(radius as string, 10)
    )

    res.json({
      success: true,
      data: { zones }
    })
  })

  // Get zone leaderboard
  getZoneLeaderboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { limit = 10 } = req.query

    const leaderboard = await ZoneService.getZoneLeaderboard(
      id,
      parseInt(limit as string, 10)
    )

    res.json({
      success: true,
      data: { leaderboard }
    })
  })
}

export default new ZoneController()
