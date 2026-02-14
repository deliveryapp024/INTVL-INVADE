import { Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { AuthenticatedRequest } from '../types'

// Add request ID to each request for tracing
export const requestId = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || uuidv4()
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  next()
}

// Extend AuthenticatedRequest type
declare global {
  namespace Express {
    interface Request {
      requestId?: string
    }
  }
}
