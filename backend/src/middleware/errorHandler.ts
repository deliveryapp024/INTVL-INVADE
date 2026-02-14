import { Response, NextFunction } from 'express'
import { AuthenticatedRequest, ApiError } from '../types'
import config from '../config'

interface CustomError extends Error {
  statusCode?: number
  code?: string
  isOperational?: boolean
}

export class AppError extends Error implements CustomError {
  statusCode: number
  code: string
  isOperational: boolean

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Handle specific error types
export const handleSupabaseError = (error: any): ApiError => {
  const code = error?.code || 'UNKNOWN_ERROR'
  const message = error?.message || 'Database error occurred'

  switch (code) {
    case '23505': // Unique violation
      return { code: 'DUPLICATE_ENTRY', message: 'Resource already exists' }
    case '23503': // Foreign key violation
      return { code: 'REFERENCE_ERROR', message: 'Referenced resource not found' }
    case '42501': // RLS violation
      return { code: 'FORBIDDEN', message: 'Access denied' }
    case 'PGRST116': // No rows returned
      return { code: 'NOT_FOUND', message: 'Resource not found' }
    default:
      return { code, message }
  }
}

// Main error handler
export const errorHandler = (
  err: CustomError,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500
  let errorResponse: ApiError = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Internal server error'
  }

  // Handle Supabase errors
  if (err.message?.includes('supabase') || err.code?.startsWith('23') || err.code?.startsWith('42')) {
    errorResponse = handleSupabaseError(err)
    statusCode = 400
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400
    errorResponse = { code: 'VALIDATION_ERROR', message: err.message }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    errorResponse = { code: 'UNAUTHORIZED', message: 'Invalid token' }
  }

  // Handle multer/file errors
  if (err.name === 'MulterError') {
    statusCode = 400
    errorResponse = { code: 'FILE_ERROR', message: err.message }
  }

  // Log error in development
  if (config.isDev) {
    console.error('Error:', {
      statusCode,
      error: errorResponse,
      stack: err.stack
    })
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: errorResponse
  })
}

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Not found handler
export const notFoundHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`
    }
  })
}
