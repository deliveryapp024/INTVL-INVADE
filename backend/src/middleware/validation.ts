import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'

interface ValidationRule {
  field: string
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'uuid'
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

interface ValidationOptions {
  body?: ValidationRule[]
  params?: ValidationRule[]
  query?: ValidationRule[]
}

// Validate single value
const validateValue = (value: any, rule: ValidationRule): string | null => {
  // Required check
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${rule.field} is required`
  }

  // Skip if not required and empty
  if (!value && !rule.required) {
    return null
  }

  // Type checks
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${rule.field} must be a string`
      }
      if (rule.min && value.length < rule.min) {
        return `${rule.field} must be at least ${rule.min} characters`
      }
      if (rule.max && value.length > rule.max) {
        return `${rule.field} must be at most ${rule.max} characters`
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `${rule.field} must be a number`
      }
      if (rule.min !== undefined && value < rule.min) {
        return `${rule.field} must be at least ${rule.min}`
      }
      if (rule.max !== undefined && value > rule.max) {
        return `${rule.field} must be at most ${rule.max}`
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${rule.field} must be a boolean`
      }
      break

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return `${rule.field} must be a valid email`
      }
      break

    case 'url':
      try {
        new URL(value)
      } catch {
        return `${rule.field} must be a valid URL`
      }
      break

    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(value)) {
        return `${rule.field} must be a valid UUID`
      }
      break
  }

  // Pattern check
  if (rule.pattern && !rule.pattern.test(value)) {
    return `${rule.field} format is invalid`
  }

  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value)
    if (result !== true) {
      return typeof result === 'string' ? result : `${rule.field} is invalid`
    }
  }

  return null
}

// Main validation middleware
export const validate = (options: ValidationOptions) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    // Validate body
    if (options.body) {
      for (const rule of options.body) {
        const error = validateValue(req.body[rule.field], rule)
        if (error) errors.push(error)
      }
    }

    // Validate params
    if (options.params) {
      for (const rule of options.params) {
        const error = validateValue(req.params[rule.field], rule)
        if (error) errors.push(error)
      }
    }

    // Validate query
    if (options.query) {
      for (const rule of options.query) {
        const error = validateValue(req.query[rule.field], rule)
        if (error) errors.push(error)
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors
        }
      })
      return
    }

    next()
  }
}

// Common validation schemas
export const schemas = {
  register: {
    body: [
      { field: 'email', type: 'email', required: true },
      { field: 'password', type: 'string', required: true, min: 8, max: 100 },
      { field: 'name', type: 'string', required: true, min: 2, max: 50 },
      { field: 'username', type: 'string', required: true, min: 3, max: 20 }
    ] as ValidationRule[]
  },
  login: {
    body: [
      { field: 'email', type: 'email', required: true },
      { field: 'password', type: 'string', required: true }
    ] as ValidationRule[]
  },
  createRun: {
    body: [
      { field: 'userId', type: 'uuid', required: true }
    ] as ValidationRule[]
  },
  updateRun: {
    params: [
      { field: 'id', type: 'uuid', required: true }
    ] as ValidationRule[],
    body: [
      { field: 'status', type: 'string', required: false },
      { field: 'endTime', type: 'string', required: false }
    ] as ValidationRule[]
  },
  coordinate: {
    body: [
      { field: 'runId', type: 'uuid', required: true },
      { field: 'latitude', type: 'number', required: true, min: -90, max: 90 },
      { field: 'longitude', type: 'number', required: true, min: -180, max: 180 }
    ] as ValidationRule[]
  },
  zoneId: {
    params: [
      { field: 'id', type: 'uuid', required: true }
    ] as ValidationRule[]
  },
  userId: {
    params: [
      { field: 'id', type: 'uuid', required: true }
    ] as ValidationRule[]
  }
}
