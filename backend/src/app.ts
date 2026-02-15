import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'

import config from './config'
import { requestLogger } from './utils/logger'
import routes from './routes'
import healthRoutes from './routes/health'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestId } from './middleware/requestId'
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics'
import { cache } from './middleware/cache'

const app: Application = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.cors.origins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}))

// Request ID for tracing
app.use(requestId)

// Rate limiting (disabled in development)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isDev ? 10000 : config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' }
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).userId || req.ip || 'unknown'
  },
  skip: (req) => config.isDev // Skip rate limiting in development
})
app.use(limiter)

// Stricter rate limiting for auth endpoints (disabled in development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isDev ? 1000 : 50, // 1000 attempts in dev, 50 in production
  message: {
    success: false,
    error: { code: 'AUTH_RATE_LIMIT', message: 'Too many auth attempts, please try again later' }
  },
  skip: (req) => config.isDev // Skip rate limiting entirely in development
})
app.use('/api/v1/auth/login', authLimiter)
app.use('/api/v1/auth/register', authLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Metrics collection
app.use(metricsMiddleware)

// Logging
if (config.isDev) {
  app.use(morgan('dev'))
} else {
  app.use(requestLogger)
}

// API Documentation (only in development)
if (config.isDev) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: '/api/openapi.json'
    }
  }))
}

// OpenAPI spec endpoint
app.get('/api/openapi.json', cache(300), (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'INVADE API',
      version: '1.0.0',
      description: 'Backend API for INVADE running app'
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1'
      }
    ],
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register new user',
          tags: ['Auth']
        }
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth']
        }
      },
      '/runs': {
        get: {
          summary: 'Get user runs',
          tags: ['Runs']
        },
        post: {
          summary: 'Create run',
          tags: ['Runs']
        }
      },
      '/zones': {
        get: {
          summary: 'Get all zones',
          tags: ['Zones']
        }
      },
      '/users/leaderboard': {
        get: {
          summary: 'Get leaderboard',
          tags: ['Users']
        }
      }
    }
  })
})

// Health checks
app.use('/health', healthRoutes)

// Metrics endpoint (for monitoring)
app.get('/metrics', metricsEndpoint)

// API routes
app.use('/api/v1', routes)

// Root endpoint
app.get('/', cache(60), (req, res) => {
  res.json({
    name: 'INVADE API',
    version: '1.0.0',
    description: 'Backend API for INVADE running app',
    documentation: '/api/docs',
    health: '/health',
    metrics: '/metrics',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

export default app
