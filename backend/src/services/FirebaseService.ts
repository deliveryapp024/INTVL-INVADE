/**
 * Firebase Admin Service
 * Handles FCM push notifications via Firebase Admin SDK
 */

import admin from 'firebase-admin'
import config from '../config'
import logger from '../utils/logger'

class FirebaseService {
  private app: admin.app.App | null = null

  constructor() {
    this.initialize()
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initialize(): void {
    try {
      // Check if already initialized
      if (admin.apps.length > 0) {
        this.app = admin.apps[0] as admin.app.App
        logger.info('Firebase Admin SDK already initialized')
        return
      }

      // Initialize with service account credentials
      const { firebase } = config

      if (!firebase.projectId || !firebase.clientEmail || !firebase.privateKey) {
        logger.error('Firebase configuration missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY')
        return
      }

      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebase.projectId,
          clientEmail: firebase.clientEmail,
          privateKey: firebase.privateKey
        })
      })

      logger.info('Firebase Admin SDK initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error)
    }
  }

  /**
   * Check if Firebase is initialized
   */
  isInitialized(): boolean {
    return this.app !== null
  }

  /**
   * Get Firebase Messaging instance
   */
  getMessaging(): admin.messaging.Messaging | null {
    if (!this.app) {
      logger.error('Firebase not initialized')
      return null
    }
    return this.app.messaging()
  }

  /**
   * Send notification to a single device
   */
  async sendToToken(
    token: string,
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return { success: false, error: 'Firebase not initialized' }
      }

      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      }

      const response = await messaging.send(message)
      logger.debug('FCM message sent:', response)

      return { success: true }
    } catch (error: any) {
      logger.error('Failed to send FCM message:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send notification to multiple devices (multicast)
   */
  async sendToTokens(
    tokens: string[],
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ): Promise<{
    success: boolean
    successCount: number
    failureCount: number
    responses: Array<{ token: string; success: boolean; error?: string }>
  }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return {
          success: false,
          successCount: 0,
          failureCount: tokens.length,
          responses: tokens.map(token => ({
            token,
            success: false,
            error: 'Firebase not initialized'
          }))
        }
      }

      // FCM supports up to 500 tokens per multicast
      const MAX_TOKENS = 500
      const batches: string[][] = []

      for (let i = 0; i < tokens.length; i += MAX_TOKENS) {
        batches.push(tokens.slice(i, i + MAX_TOKENS))
      }

      const allResponses: Array<{ token: string; success: boolean; error?: string }> = []

      for (const batch of batches) {
        const message: admin.messaging.MulticastMessage = {
          tokens: batch,
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.imageUrl
          },
          data: notification.data,
          android: {
            priority: 'high',
            notification: {
              channelId: 'default',
              priority: 'high',
              defaultSound: true,
              defaultVibrateTimings: true
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1
              }
            }
          }
        }

        const response = await messaging.sendEachForMulticast(message)

        // Process responses
        response.responses.forEach((resp: { success: boolean; error?: { message: string } }, index: number) => {
          allResponses.push({
            token: batch[index],
            success: resp.success,
            error: resp.error?.message
          })
        })
      }

      const successCount = allResponses.filter(r => r.success).length
      const failureCount = allResponses.filter(r => !r.success).length

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        responses: allResponses
      }
    } catch (error: any) {
      logger.error('Failed to send multicast FCM message:', error)
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        responses: tokens.map(token => ({
          token,
          success: false,
          error: error.message
        }))
      }
    }
  }

  /**
   * Send to topic
   */
  async sendToTopic(
    topic: string,
    notification: {
      title: string
      body: string
      imageUrl?: string
      data?: Record<string, string>
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return { success: false, error: 'Firebase not initialized' }
      }

      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      }

      const response = await messaging.send(message)
      logger.debug('FCM topic message sent:', response)

      return { success: true }
    } catch (error: any) {
      logger.error('Failed to send FCM topic message:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Subscribe tokens to topic
   */
  async subscribeToTopic(
    tokens: string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return { success: false, error: 'Firebase not initialized' }
      }

      const response = await messaging.subscribeToTopic(tokens, topic)
      logger.debug('FCM topic subscription:', response)

      if (response.failureCount > 0) {
        logger.warn('Some tokens failed to subscribe:', response.errors)
      }

      return { success: response.successCount > 0 }
    } catch (error: any) {
      logger.error('Failed to subscribe to topic:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Unsubscribe tokens from topic
   */
  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return { success: false, error: 'Firebase not initialized' }
      }

      const response = await messaging.unsubscribeFromTopic(tokens, topic)
      logger.debug('FCM topic unsubscription:', response)

      return { success: response.successCount > 0 }
    } catch (error: any) {
      logger.error('Failed to unsubscribe from topic:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const messaging = this.getMessaging()
      if (!messaging) {
        return { valid: false, error: 'Firebase not initialized' }
      }

      // Try to send a dry-run message to validate token
      await messaging.send({
        token,
        data: { test: 'validation' }
      }, true) // dryRun = true

      return { valid: true }
    } catch (error: any) {
      return { valid: false, error: error.message }
    }
  }
}

// Singleton instance
export const firebaseService = new FirebaseService()

export default firebaseService
