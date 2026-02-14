import { Router } from 'express'
import WebhookService from '../services/WebhookService'
import { verifySupabaseToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/admin'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// All webhook routes require admin access
router.use(verifySupabaseToken)
router.use(requireAdmin)

// Register new webhook
router.post('/', asyncHandler(async (req, res) => {
  const { url, events, secret } = req.body

  const webhook = await WebhookService.registerWebhook(url, events, secret)

  res.status(201).json({
    success: true,
    data: { webhook }
  })
}))

// Get webhook deliveries
router.get('/:id/deliveries', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { limit = 50 } = req.query

  const deliveries = await WebhookService.getDeliveries(id, parseInt(limit as string, 10))

  res.json({
    success: true,
    data: { deliveries }
  })
}))

// Delete webhook
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  await WebhookService.deleteWebhook(id)

  res.json({
    success: true,
    data: { message: 'Webhook deleted successfully' }
  })
}))

// Test webhook endpoint (for receiving webhooks)
router.post('/receive', asyncHandler(async (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string
  const event = req.headers['x-webhook-event'] as string
  const webhookId = req.headers['x-webhook-id'] as string

  if (!signature || !event) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_HEADERS', message: 'Missing webhook headers' }
    })
    return
  }

  // In a real implementation, verify the signature here
  // const isValid = WebhookService.verifySignature(JSON.stringify(req.body), signature, secret)

  res.json({
    success: true,
    data: {
      received: true,
      event,
      webhookId,
      timestamp: new Date().toISOString()
    }
  })
}))

export default router
