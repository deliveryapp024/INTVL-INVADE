/**
 * Notification Queue Service
 * Manages scheduled notifications using BullMQ + Redis
 */

import { Queue, Worker, Job } from 'bullmq'
import { supabaseAdmin } from '../config/supabase'
import { firebaseService } from './FirebaseService'
import logger from '../utils/logger'
import config from '../config'

// Queue name
const NOTIFICATION_QUEUE = 'notification-queue'

// Queue instance
let notificationQueue: Queue | null = null

/**
 * Initialize notification queue
 */
export function initializeNotificationQueue(): Queue {
  if (!config.redis.url) {
    logger.error('Redis URL not configured. Notifications scheduling will not work.')
    throw new Error('Redis URL required for notification scheduling')
  }

  notificationQueue = new Queue(NOTIFICATION_QUEUE, {
    connection: {
      url: config.redis.url
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  })

  logger.info('Notification queue initialized')
  return notificationQueue
}

/**
 * Get queue instance
 */
export function getNotificationQueue(): Queue {
  if (!notificationQueue) {
    return initializeNotificationQueue()
  }
  return notificationQueue
}

/**
 * Schedule a notification
 */
export async function scheduleNotification(
  jobId: string,
  scheduledFor: Date
): Promise<void> {
  const queue = getNotificationQueue()
  
  const delay = scheduledFor.getTime() - Date.now()
  
  if (delay <= 0) {
    // If scheduled time is in the past or now, add immediately
    await queue.add('send-notification', { jobId }, { delay: 0 })
  } else {
    // Schedule for future
    await queue.add('send-notification', { jobId }, { delay })
  }

  logger.info(`Notification job ${jobId} scheduled for ${scheduledFor.toISOString()}`)
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(jobId: string): Promise<boolean> {
  try {
    const queue = getNotificationQueue()
    
    // Find and remove the job
    const jobs = await queue.getJobs(['delayed', 'waiting'])
    const job = jobs.find(j => j.data.jobId === jobId)
    
    if (job) {
      await job.remove()
      
      // Update database status
      await supabaseAdmin
        .from('notification_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId)
      
      logger.info(`Notification job ${jobId} cancelled`)
      return true
    }
    
    return false
  } catch (error) {
    logger.error('Failed to cancel notification:', error)
    return false
  }
}

/**
 * Process notification job
 */
async function processNotificationJob(job: Job<{ jobId: string }>): Promise<void> {
  const { jobId } = job.data
  
  try {
    logger.info(`Processing notification job ${jobId}`)
    
    // Get job details from database
    const { data: notificationJob, error } = await supabaseAdmin
      .from('notification_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (error || !notificationJob) {
      logger.error(`Notification job ${jobId} not found`)
      return
    }
    
    // Skip if cancelled
    if (notificationJob.status === 'cancelled') {
      logger.info(`Notification job ${jobId} is cancelled, skipping`)
      return
    }
    
    // Update status to sending
    await supabaseAdmin
      .from('notification_jobs')
      .update({ status: 'sending', queued_at: new Date().toISOString() })
      .eq('id', jobId)
    
    // Get target tokens based on target type
    let tokens: Array<{ token: string; platform: string; user_id: string }> = []
    
    if (notificationJob.target_type === 'specific') {
      // Get tokens for specific users
      const { data: userTokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token, platform, user_id')
        .in('user_id', notificationJob.target_user_ids || [])
        .eq('is_active', true)
        .eq('provider', 'fcm')
      
      tokens = userTokens || []
    } else if (notificationJob.target_type === 'segment') {
      // Build query for segment
      let query = supabaseAdmin
        .from('push_tokens')
        .select('token, platform, user_id, users!inner(*)')
        .eq('is_active', true)
        .eq('provider', 'fcm')
      
      const filter = notificationJob.segment_filter || {}
      
      if (filter.minLevel) {
        query = query.gte('users.level', filter.minLevel)
      }
      
      if (filter.maxLevel) {
        query = query.lte('users.level', filter.maxLevel)
      }
      
      if (filter.lastSeenDays) {
        const dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - filter.lastSeenDays)
        query = query.gte('users.last_seen_at', dateFrom.toISOString())
      }
      
      if (filter.platform && filter.platform !== 'all') {
        query = query.eq('platform', filter.platform)
      }
      
      const { data: segmentTokens } = await query
      tokens = segmentTokens || []
    } else if (notificationJob.target_type === 'all') {
      // Get all active tokens
      const { data: allTokens } = await supabaseAdmin
        .from('push_tokens')
        .select('token, platform, user_id')
        .eq('is_active', true)
        .eq('provider', 'fcm')
      
      tokens = allTokens || []
    }
    
    // Update requested count
    await supabaseAdmin
      .from('notification_jobs')
      .update({ requested_count: tokens.length })
      .eq('id', jobId)
    
    if (tokens.length === 0) {
      logger.warn(`No tokens found for notification job ${jobId}`)
      await supabaseAdmin
        .from('notification_jobs')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: 0,
          failed_count: 0
        })
        .eq('id', jobId)
      return
    }
    
    // Send notifications
    const tokenList = tokens.map(t => t.token)
    const notification = {
      title: notificationJob.title,
      body: notificationJob.body,
      imageUrl: notificationJob.image_url || undefined,
      data: notificationJob.data || {}
    }
    
    const result = await firebaseService.sendToTokens(tokenList, notification)
    
    // Record results
    const results = tokens.map((t, index) => ({
      job_id: jobId,
      user_id: t.user_id,
      token_id: null, // Could store token ID if needed
      platform: t.platform,
      status: result.responses[index]?.success ? 'sent' : 'failed',
      error_code: result.responses[index]?.error ? 'FCM_ERROR' : null,
      error_message: result.responses[index]?.error || null,
      created_at: new Date().toISOString()
    }))
    
    // Insert results in batches
    const BATCH_SIZE = 100
    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE)
      await supabaseAdmin.from('notification_job_results').insert(batch)
    }
    
    // Update job status
    await supabaseAdmin
      .from('notification_jobs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: result.successCount,
        failed_count: result.failureCount
      })
      .eq('id', jobId)
    
    logger.info(`Notification job ${jobId} completed: ${result.successCount} sent, ${result.failureCount} failed`)
    
  } catch (error) {
    logger.error(`Failed to process notification job ${jobId}:`, error)
    
    // Update job status to failed
    await supabaseAdmin
      .from('notification_jobs')
      .update({
        status: 'failed',
        sent_at: new Date().toISOString()
      })
      .eq('id', jobId)
    
    throw error
  }
}

/**
 * Initialize notification worker
 */
export function initializeNotificationWorker(): Worker {
  if (!config.redis.url) {
    throw new Error('Redis URL required for notification worker')
  }
  
  const worker = new Worker(
    NOTIFICATION_QUEUE,
    processNotificationJob,
    {
      connection: {
        url: config.redis.url
      },
      concurrency: 5
    }
  )
  
  worker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`)
  })
  
  worker.on('failed', (job, error) => {
    logger.error(`Notification job ${job?.id} failed:`, error)
  })
  
  logger.info('Notification worker initialized')
  return worker
}

/**
 * Retry failed notification job
 */
export async function retryNotificationJob(jobId: string): Promise<boolean> {
  try {
    const { data: job } = await supabaseAdmin
      .from('notification_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (!job || job.status !== 'failed') {
      return false
    }
    
    // Reset status and reschedule
    await supabaseAdmin
      .from('notification_jobs')
      .update({ status: 'scheduled', sent_at: null })
      .eq('id', jobId)
    
    // Schedule immediate execution
    await scheduleNotification(jobId, new Date())
    
    return true
  } catch (error) {
    logger.error('Failed to retry notification:', error)
    return false
  }
}

export default {
  initializeNotificationQueue,
  getNotificationQueue,
  scheduleNotification,
  cancelScheduledNotification,
  initializeNotificationWorker,
  retryNotificationJob
}
