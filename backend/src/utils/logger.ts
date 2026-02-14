import winston from 'winston'
import config from '../config'

const { combine, timestamp, json, printf, colorize, errors } = winston.format

// Console format for development
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  
  if (stack) {
    msg += `\n${stack}`
  }
  
  return msg
})

// Create logger instance
export const logger = winston.createLogger({
  level: config.log.level,
  defaultMeta: { service: 'invade-backend' },
  transports: [
    // File transports
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json(), errors({ stack: true }))
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json())
    })
  ]
})

// Add console transport in development
if (config.isDev) {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      consoleFormat
    )
  }))
}

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  })
  
  next()
}

export default logger
