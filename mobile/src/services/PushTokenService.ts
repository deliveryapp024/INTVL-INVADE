import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import logger from '../utils/Logger';

export interface PushTokenData {
  token: string;
  platform: 'ios' | 'android';
  provider: 'fcm' | 'expo';
}

class PushTokenService {
  private currentToken: string | null = null;

  /**
   * Request permission for push notifications
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        logger.warn('Push notifications require a physical device');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Push notification permissions denied');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error requesting push permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM push token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Get push token
      const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
        projectId: '914047828656', // Your Firebase project number
      });

      if (!tokenData?.data) {
        return null;
      }

      this.currentToken = tokenData.data;
      logger.info('FCM token obtained successfully');

      return tokenData.data;
    } catch (error) {
      logger.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register push token with backend
   */
  async registerTokenWithBackend(userId: string, token: string): Promise<boolean> {
    try {
      const platform = Platform.OS as 'ios' | 'android';
      
      // Check if token already exists for this user
      const { data: existingToken } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('token', token)
        .single();

      if (existingToken) {
        // Update existing token
        const { error } = await supabase
          .from('push_tokens')
          .update({
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingToken.id);

        if (error) throw error;
      } else {
        // Insert new token
        const { error } = await supabase
          .from('push_tokens')
          .insert({
            user_id: userId,
            token: token,
            platform: platform,
            provider: 'fcm',
            is_active: true,
          });

        if (error) throw error;
      }

      logger.info('Push token registered with backend');
      return true;
    } catch (error) {
      logger.error('Error registering push token:', error);
      return false;
    }
  }

  /**
   * Register push token for current user
   */
  async registerForUser(userId: string): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (!token) {
        return false;
      }

      // Register with backend
      return await this.registerTokenWithBackend(userId, token);
    } catch (error) {
      logger.error('Error in registerForUser:', error);
      return false;
    }
  }

  /**
   * Refresh push token (call on app startup)
   */
  async refreshToken(userId: string): Promise<boolean> {
    try {
      const token = await this.getFCMToken();
      if (!token) {
        return false;
      }

      // Only register if token changed or not registered
      if (token !== this.currentToken) {
        return await this.registerTokenWithBackend(userId, token);
      }

      return true;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Unregister push token (call on logout)
   */
  async unregisterToken(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      this.currentToken = null;
      logger.info('Push token unregistered');
      return true;
    } catch (error) {
      logger.error('Error unregistering token:', error);
      return false;
    }
  }

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listen for incoming notifications
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.info('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listen for notification responses (user taps)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        logger.info('Notification response:', response);
        onNotificationResponse?.(response);
      }
    );

    return {
      remove: () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      },
    };
  }

  /**
   * Handle notification data
   */
  handleNotificationData(data: Record<string, any>): void {
    // Handle different notification types
    switch (data.type) {
      case 'achievement_unlocked':
        // Handle achievement notification
        break;
      case 'friend_activity':
        // Handle friend activity
        break;
      case 'zone_captured':
        // Handle zone capture
        break;
      case 'challenge_invite':
        // Handle challenge invite
        break;
      default:
        logger.info('Unknown notification type:', data.type);
    }
  }
}

export const pushTokenService = new PushTokenService();
export default pushTokenService;
