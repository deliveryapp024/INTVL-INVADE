import app from './app'
import config from './config'
import logger from './utils/logger'

const PORT = config.port
const HOST = config.host

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
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
