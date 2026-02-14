import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../types'

interface Metric {
  name: string
  value: number
  timestamp: Date
  labels?: Record<string, string>
}

// Simple in-memory metrics store
// In production, use Prometheus, DataDog, or CloudWatch
class MetricsCollector {
  private counters: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()
  private gauges: Map<string, number> = new Map()

  increment(name: string, labels?: Record<string, string>, value = 1) {
    const key = this.getKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
  }

  gauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getKey(name, labels)
    this.gauges.set(key, value)
  }

  histogram(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getKey(name, labels)
    const values = this.histograms.get(key) || []
    values.push(value)
    // Keep last 1000 values
    if (values.length > 1000) values.shift()
    this.histograms.set(key, values)
  }

  getMetrics() {
    const metrics: Record<string, any> = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: {}
    }

    // Calculate histogram stats
    for (const [key, values] of this.histograms) {
      if (values.length === 0) continue
      const sorted = [...values].sort((a, b) => a - b)
      metrics.histograms[key] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      }
    }

    return metrics
  }

  private getKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(',')
    return `${name}{${labelStr}}`
  }
}

export const metrics = new MetricsCollector()

// Middleware to track request metrics
export const metricsMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now()
  const route = req.route?.path || req.path

  // Increment request counter
  metrics.increment('http_requests_total', {
    method: req.method,
    route: route,
    status: 'pending'
  })

  // Track active requests
  metrics.gauge('http_requests_active', 1, {
    method: req.method
  })

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode.toString()

    // Record request duration
    metrics.histogram('http_request_duration_ms', duration, {
      method: req.method,
      route: route,
      status: statusCode
    })

    // Update request counter with final status
    metrics.increment('http_requests_total', {
      method: req.method,
      route: route,
      status: statusCode
    })

    // Track by status code category
    const statusCategory = `${statusCode[0]}xx`
    metrics.increment('http_requests_by_status', {
      category: statusCategory
    })

    // Update active requests
    metrics.gauge('http_requests_active', -1, {
      method: req.method
    })

    // Track authenticated requests
    if (req.userId) {
      metrics.increment('http_requests_authenticated', {
        method: req.method
      })
    }
  })

  next()
}

// Endpoint to expose metrics
export const metricsEndpoint = (req: AuthenticatedRequest, res: Response) => {
  const metricsData = metrics.getMetrics()
  
  // Prometheus format
  if (req.headers.accept?.includes('application/openmetrics')) {
    let output = ''
    
    // Counters
    for (const [key, value] of Object.entries(metricsData.counters)) {
      output += `# TYPE ${key.split('{')[0]} counter\n`
      output += `${key} ${value}\n`
    }
    
    // Gauges
    for (const [key, value] of Object.entries(metricsData.gauges)) {
      output += `# TYPE ${key.split('{')[0]} gauge\n`
      output += `${key} ${value}\n`
    }
    
    // Histograms
    for (const [key, stats] of Object.entries(metricsData.histograms)) {
      output += `# TYPE ${key.split('{')[0]} histogram\n`
      output += `${key}_count ${stats.count}\n`
      output += `${key}_sum ${stats.sum}\n`
    }

    res.setHeader('Content-Type', 'text/plain')
    res.send(output)
  } else {
    // JSON format
    res.json({
      timestamp: new Date().toISOString(),
      ...metricsData
    })
  }
}
