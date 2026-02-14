import crypto from 'crypto'
import { supabaseAdmin } from '../config/supabase'
import { AppError } from '../middleware/errorHandler'

interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  signature?: string
}

interface WebhookConfig {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  retryCount: number
}

class WebhookService {
  private retryAttempts = 3
  private retryDelay = 5000 // 5 seconds

  // Register a new webhook
  async registerWebhook(
    url: string,
    events: string[],
    secret?: string
  ): Promise<WebhookConfig> {
    // Validate URL
    try {
      new URL(url)
    } catch {
      throw new AppError('Invalid webhook URL', 400, 'INVALID_URL')
    }

    // Generate secret if not provided
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex')

    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .insert({
        url,
        events,
        secret: webhookSecret,
        is_active: true,
        retry_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.is_active,
      retryCount: webhook.retry_count
    }
  }

  // Send webhook event
  async sendEvent(event: string, data: any, userId?: string): Promise<void> {
    // Get active webhooks for this event
    const { data: webhooks } = await supabaseAdmin
      .from('webhooks')
      .select('*')
      .contains('events', [event])
      .eq('is_active', true)

    if (!webhooks || webhooks.length === 0) return

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString()
    }

    // Send to all matching webhooks
    await Promise.all(
      webhooks.map(webhook =>
        this.sendWebhook(webhook, payload)
      )
    )
  }

  // Send webhook with retry logic
  private async sendWebhook(
    webhook: any,
    payload: WebhookPayload
  ): Promise<void> {
    const signature = this.generateSignature(payload, webhook.secret)

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': payload.event,
            'X-Webhook-Id': webhook.id,
            'X-Webhook-Attempt': (attempt + 1).toString()
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          // Log successful delivery
          await this.logDelivery(webhook.id, payload.event, 'success', response.status)
          
          // Reset retry count
          await supabaseAdmin
            .from('webhooks')
            .update({ retry_count: 0 })
            .eq('id', webhook.id)
          
          return
        }

        throw new Error(`HTTP ${response.status}`)
      } catch (error) {
        const isLastAttempt = attempt === this.retryAttempts - 1
        
        if (isLastAttempt) {
          // Log failed delivery
          await this.logDelivery(
            webhook.id,
            payload.event,
            'failed',
            0,
            (error as Error).message
          )

          // Increment retry count
          await supabaseAdmin
            .from('webhooks')
            .update({ retry_count: webhook.retry_count + 1 })
            .eq('id', webhook.id)

          // Disable webhook if too many failures
          if (webhook.retry_count >= 10) {
            await supabaseAdmin
              .from('webhooks')
              .update({ is_active: false })
              .eq('id', webhook.id)
          }
        } else {
          // Wait before retry
          await this.delay(this.retryDelay * Math.pow(2, attempt))
        }
      }
    }
  }

  // Verify webhook signature
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(JSON.parse(payload), secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  }

  // Generate webhook signature
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload)
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex')
  }

  // Log delivery attempt
  private async logDelivery(
    webhookId: string,
    event: string,
    status: 'success' | 'failed',
    httpStatus: number,
    error?: string
  ): Promise<void> {
    await supabaseAdmin
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhookId,
        event,
        status,
        http_status: httpStatus,
        error_message: error,
        delivered_at: status === 'success' ? new Date().toISOString() : null
      })
  }

  // Get webhook deliveries
  async getDeliveries(webhookId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return data || []
  }

  // Delete webhook
  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('webhooks')
      .delete()
      .eq('id', webhookId)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new WebhookService()
