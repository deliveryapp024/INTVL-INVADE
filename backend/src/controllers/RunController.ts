import { Response } from 'express'
import { AuthenticatedRequest } from '../types'
import RunService from '../services/RunService'
import { asyncHandler } from '../middleware/errorHandler'

export class RunController {
  // Create a new run
  createRun = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { startTime } = req.body

    const run = await RunService.createRun({
      userId: req.userId!,
      startTime: startTime ? new Date(startTime) : undefined
    })

    res.status(201).json({
      success: true,
      data: { run }
    })
  })

  // Get run by ID
  getRunById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const run = await RunService.getRunById(id, req.userId)

    res.json({
      success: true,
      data: { run }
    })
  })

  // Update run
  updateRun = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { status, endTime } = req.body

    const run = await RunService.updateRun(
      id,
      { status, endTime: endTime ? new Date(endTime) : undefined },
      req.userId
    )

    res.json({
      success: true,
      data: { run }
    })
  })

  // Save coordinate
  saveCoordinate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { runId, latitude, longitude, accuracy, altitude, speed, timestamp } = req.body

    const coordinate = await RunService.saveCoordinate(runId, {
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      timestamp: new Date(timestamp)
    })

    res.status(201).json({
      success: true,
      data: { coordinate }
    })
  })

  // Save multiple coordinates
  saveCoordinates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { runId, coordinates } = req.body

    const saved = await RunService.saveCoordinates(
      runId,
      coordinates.map((c: any) => ({
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        altitude: c.altitude,
        speed: c.speed,
        timestamp: new Date(c.timestamp)
      }))
    )

    res.status(201).json({
      success: true,
      data: { coordinates: saved }
    })
  })

  // Complete run
  completeRun = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params
    const { coordinates, distance, duration, averageSpeed, maxSpeed, caloriesBurned } = req.body

    const run = await RunService.completeRun(id, {
      coordinates: coordinates.map((c: any) => ({
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        altitude: c.altitude,
        speed: c.speed,
        timestamp: new Date(c.timestamp)
      })),
      distance,
      duration,
      averageSpeed,
      maxSpeed,
      caloriesBurned
    })

    res.json({
      success: true,
      data: { run }
    })
  })

  // Get user's runs
  getUserRuns = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 10, offset = 0, status } = req.query

    const result = await RunService.getUserRuns(req.userId!, {
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
      status: status as string
    })

    res.json({
      success: true,
      data: result.runs,
      meta: {
        total: result.total,
        page: Math.floor(parseInt(offset as string, 10) / parseInt(limit as string, 10)) + 1,
        limit: parseInt(limit as string, 10),
        hasMore: result.total > parseInt(offset as string, 10) + parseInt(limit as string, 10)
      }
    })
  })

  // Get run coordinates
  getRunCoordinates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    const coordinates = await RunService.getRunCoordinates(id)

    res.json({
      success: true,
      data: { coordinates }
    })
  })

  // Get user stats
  getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await RunService.getUserStats(req.userId!)

    res.json({
      success: true,
      data: { stats }
    })
  })

  // Delete run
  deleteRun = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params

    await RunService.deleteRun(id, req.userId)

    res.json({
      success: true,
      data: { message: 'Run deleted successfully' }
    })
  })
}

export default new RunController()
