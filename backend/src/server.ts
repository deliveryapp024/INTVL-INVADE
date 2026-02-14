import app from './app'
import config from './config'
import logger from './utils/logger'
import { initializeNotificationQueue, initializeNotificationWorker } from './services/NotificationQueueService'

const PORT = config.port
const HOST = config.host

// Initialize services
let notificationWorker: any = null

if (config.redis.url) {
  try {
    initializeNotificationQueue()
    notificationWorker = initializeNotificationWorker()
    logger.info('✅ Notification queue and worker initialized')
  } catch (error) {
    logger.error('❌ Failed to initialize notification queue:', error)
  }
} else {
  logger.warn('⚠️ Redis URL not configured. Notification scheduling will not be available.')
}

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
  // Close notification worker
  if (notificationWorker) {
    notificationWorker.close()
    logger.info('Notification worker closed')
  }
  
  // Close server
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown')
    process.exit(1)
  }, 10000)
}

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server running on http://${HOST}:${PORT}`)
  logger.info(`📊 Environment: ${config.nodeEnv}`)
  logger.info(`🔗 Supabase URL: ${config.supabase.url}`)
})

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})
