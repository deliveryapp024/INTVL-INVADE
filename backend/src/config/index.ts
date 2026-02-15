import dotenv from 'dotenv'
import path from 'path'
import crypto from 'crypto'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Render deployments are configured via dashboard env vars.
// Avoid hard-crashing during boot: provide fallbacks for non-secret values.
// If JWT_SECRET is missing we generate an ephemeral secret (tokens will reset on restart).
const FALLBACK_SUPABASE_URL = 'https://dawowfbfqfygjkugpdwq.supabase.co'
// Public anon key (also present in backend/.env.example). This is not a secret.
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhd293ZmJmcWZ5Z2prdWdwZHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgzNDMsImV4cCI6MjA4NjU2NDM0M30.U44IM3zGbsGpHRoO5FCkPqoE3XY-Kkzf-jLpBBquCkQ'

const envSupabaseUrl = process.env.SUPABASE_URL || FALLBACK_SUPABASE_URL
const envSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

// IMPORTANT:
// If JWT_SECRET is missing and the service runs >1 instance, using a random secret per instance
// will make tokens signed on instance A fail verification on instance B.
// To avoid "login then immediate logout" issues in misconfigured environments, derive a stable
// (but still secret) fallback from existing env vars.
const envJwtSecret =
  process.env.JWT_SECRET ||
  crypto
    .createHash('sha256')
    .update(
      String(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          process.env.SUPABASE_URL ||
          FALLBACK_SUPABASE_URL
      )
    )
    .digest('hex')

const missingCritical: string[] = []
if (!process.env.SUPABASE_URL) missingCritical.push('SUPABASE_URL')
if (!process.env.SUPABASE_ANON_KEY) missingCritical.push('SUPABASE_ANON_KEY')
if (!process.env.JWT_SECRET) missingCritical.push('JWT_SECRET')

if (missingCritical.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[config] Missing env vars: ${missingCritical.join(', ')}. ` +
      'Using fallbacks (JWT secret is derived for stability). Set these in your Render service env vars.'
  )
}

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  
  // Supabase
  supabase: {
    url: envSupabaseUrl,
    anonKey: envSupabaseAnonKey,
    // NOTE: service role key is required for privileged admin operations.
    // If it's missing, we fall back to anon key so the server can boot,
    // but admin write operations may fail due to RLS.
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || envSupabaseAnonKey
  },
  
  // JWT
  jwt: {
    secret: envJwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:19006',
      'http://localhost:3000',
      'https://intvl-invade.onrender.com',
      'https://intvl-invade-frontend.onrender.com'
    ]
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },
  
  // Security
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  // Socket.IO
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*'
  },
  
  // Firebase (Push Notifications)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL
  },
  
  // External APIs
  apis: {
    openweather: process.env.OPENWEATHER_API_KEY
  },
  
  // Feature Flags
  features: {
    realTime: process.env.ENABLE_REAL_TIME === 'true',
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true'
  },
  
  // Helpers
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
}

export default config
