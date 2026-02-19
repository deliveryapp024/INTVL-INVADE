/**
 * Notification Service
 * Local push notifications - no server required!
 * All notifications are scheduled and managed on the device
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lazy import expo-notifications to avoid Expo Go issues
let Notifications: typeof import('expo-notifications') | null = null;

// Initialize notifications module lazily
async function getNotifications() {
  if (!Notifications) {
    try {
      Notifications = await import('expo-notifications');
      // Configure handler after import
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (error) {
      console.log('expo-notifications not available');
      return null;
    }
  }
  return Notifications;
}

// Check if notifications are available
async function isNotificationsAvailable(): Promise<boolean> {
  const notifs = await getNotifications();
  return notifs !== null && Device.isDevice && Platform.OS !== 'web';
}

// Notification categories/types
export enum NotificationType {
  DAILY_REMINDER = 'daily_reminder',
  STREAK_WARNING = 'streak_warning',
  ACHIEVEMENT = 'achievement',
  ZONE_CAPTURED = 'zone_captured',
  FRIEND_ACTIVITY = 'friend_activity',
  WEEKLY_SUMMARY = 'weekly_summary',
  CHALLENGE = 'challenge',
  INACTIVITY = 'inactivity',
}

// User notification preferences
export interface NotificationPreferences {
  enabled: boolean;
  [NotificationType.DAILY_REMINDER]: boolean;
  [NotificationType.STREAK_WARNING]: boolean;
  [NotificationType.ACHIEVEMENT]: boolean;
  [NotificationType.ZONE_CAPTURED]: boolean;
  [NotificationType.FRIEND_ACTIVITY]: boolean;
  [NotificationType.WEEKLY_SUMMARY]: boolean;
  [NotificationType.CHALLENGE]: boolean;
  [NotificationType.INACTIVITY]: boolean;
  reminderTime: { hour: number; minute: number };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  [NotificationType.DAILY_REMINDER]: true,
  [NotificationType.STREAK_WARNING]: true,
  [NotificationType.ACHIEVEMENT]: true,
  [NotificationType.ZONE_CAPTURED]: true,
  [NotificationType.FRIEND_ACTIVITY]: false,
  [NotificationType.WEEKLY_SUMMARY]: true,
  [NotificationType.CHALLENGE]: true,
  [NotificationType.INACTIVITY]: true,
  reminderTime: { hour: 7, minute: 0 },
};

const PREFS_KEY = '@inv_notification_prefs';

export const NotificationService = {
  /**
   * Request permission to send notifications
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const notifs = await getNotifications();
    if (!notifs) return false;

    const { status: existingStatus } = await notifs.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notifs.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions denied');
      return false;
    }

    return true;
  },

  /**
   * Check if notifications are enabled
   */
  async checkPermissions(): Promise<boolean> {
    const notifs = await getNotifications();
    if (!notifs) return false;

    const { status } = await notifs.getPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Get user notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = await AsyncStorage.getItem(PREFS_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.log('Error loading notification prefs:', error);
    }
    return DEFAULT_PREFERENCES;
  },

  /**
   * Save user notification preferences
   */
  async savePreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    try {
      const current = await this.getPreferences();
      const updated = { ...current, ...prefs };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));

      // Reschedule notifications based on new preferences
      await this.rescheduleAllNotifications();
    } catch (error) {
      console.log('Error saving notification prefs:', error);
    }
  },

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    trigger: any,
    type: NotificationType,
    data?: Record<string, any>
  ): Promise<string | null> {
    const notifs = await getNotifications();
    if (!notifs) return null;

    const prefs = await this.getPreferences();

    // Check if this notification type is enabled
    if (!prefs.enabled || !prefs[type]) {
      return null;
    }

    try {
      const id = await notifs.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type, ...data },
          sound: 'default',
          badge: 1,
        },
        trigger,
      });
      return id;
    } catch (error) {
      console.log('Error scheduling notification:', error);
      return null;
    }
  },

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    const notifs = await getNotifications();
    if (!notifs) return;

    await notifs.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    const notifs = await getNotifications();
    if (!notifs) return;

    await notifs.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    const notifs = await getNotifications();
    if (!notifs) return [];

    return await notifs.getAllScheduledNotificationsAsync();
  },

  // ============== SMART NOTIFICATION SCHEDULING ==============

  /**
   * Schedule daily run reminder
   */
  async scheduleDailyReminder(hour: number = 7, minute: number = 0): Promise<void> {
    const notifs = await getNotifications();
    if (!notifs) return;

    // Cancel existing daily reminders first
    await this.cancelNotificationsByType(NotificationType.DAILY_REMINDER);

    const messages = [
      { title: '🏃 Time to Run!', body: 'Your zones are waiting! Go capture some territory!' },
      { title: '🔥 Streak Alert!', body: 'Run today to keep your streak alive!' },
      { title: '🌅 Morning Runner?', body: 'Start your day with a zone capture!' },
      { title: '💪 Fitness Check', body: 'Ready to conquer some zones today?' },
    ];

    // Pick random message
    const msg = messages[Math.floor(Math.random() * messages.length)];

    await this.scheduleNotification(
      msg.title,
      msg.body,
      {
        type: notifs.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour,
        minute,
      },
      NotificationType.DAILY_REMINDER
    );
  },

  /**
   * Schedule streak warning (if user hasn't run by evening)
   */
  async scheduleStreakWarning(currentStreak: number): Promise<void> {
    if (currentStreak < 2) return;

    const notifs = await getNotifications();
    if (!notifs) return;

    await this.cancelNotificationsByType(NotificationType.STREAK_WARNING);

    await this.scheduleNotification(
      '🔥 Streak in Danger!',
      `Your ${currentStreak}-day streak ends tonight! Run now to save it!`,
      {
        type: notifs.SchedulableTriggerInputTypes?.DAILY || 'daily',
        hour: 19,
        minute: 0,
      },
      NotificationType.STREAK_WARNING,
      { streak: currentStreak }
    );
  },

  /**
   * Schedule achievement notification
   */
  async scheduleAchievementNotification(achievementName: string): Promise<void> {
    await this.scheduleNotification(
      '🏆 Achievement Unlocked!',
      `Congratulations! You've earned: ${achievementName}`,
      null,
      NotificationType.ACHIEVEMENT,
      { achievementName }
    );
  },

  /**
   * Schedule zone captured notification
   */
  async scheduleZoneCapturedNotification(zoneName: string): Promise<void> {
    await this.scheduleNotification(
      '🎯 Zone Captured!',
      `You've captured ${zoneName}! Keep running to claim more!`,
      null,
      NotificationType.ZONE_CAPTURED,
      { zoneName }
    );
  },

  /**
   * Schedule weekly summary
   */
  async scheduleWeeklySummary(totalRuns: number, totalDistance: number): Promise<void> {
    const notifs = await getNotifications();
    if (!notifs) return;

    await this.scheduleNotification(
      '📊 Weekly Summary',
      `You completed ${totalRuns} runs this week covering ${(totalDistance / 1000).toFixed(1)}km! Amazing!`,
      {
        type: notifs.SchedulableTriggerInputTypes?.WEEKLY || 'weekly',
        weekday: 1,
        hour: 9,
        minute: 0,
      },
      NotificationType.WEEKLY_SUMMARY,
      { totalRuns, totalDistance }
    );
  },

  /**
   * Schedule challenge notification
   */
  async scheduleChallengeNotification(challengeTitle: string): Promise<void> {
    await this.scheduleNotification(
      '🎯 New Challenge Available!',
      challengeTitle,
      null,
      NotificationType.CHALLENGE
    );
  },

  /**
   * Schedule inactivity reminder
   */
  async scheduleInactivityReminder(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    await this.scheduleNotification(
      '👋 We Miss You!',
      "It's been 3 days since your last run. Ready to get back out there?",
      {
        type: 'date',
        date: threeDaysFromNow,
      },
      NotificationType.INACTIVITY
    );
  },

  /**
   * Cancel notifications by type
   */
  async cancelNotificationsByType(type: NotificationType): Promise<void> {
    const notifications = await this.getScheduledNotifications();
    for (const notification of notifications) {
      if (notification.content?.data?.type === type) {
        await this.cancelNotification(notification.identifier);
      }
    }
  },

  /**
   * Reschedule all notifications based on preferences
   */
  async rescheduleAllNotifications(): Promise<void> {
    const prefs = await this.getPreferences();

    // Cancel all first
    await this.cancelAllNotifications();

    if (!prefs.enabled) return;

    // Reschedule based on preferences
    if (prefs[NotificationType.DAILY_REMINDER]) {
      await this.scheduleDailyReminder(prefs.reminderTime.hour, prefs.reminderTime.minute);
    }

    if (prefs[NotificationType.WEEKLY_SUMMARY]) {
      await this.scheduleWeeklySummary(0, 0);
    }
  },

  // ============== NOTIFICATION LISTENERS ==============

  /**
   * Listen for incoming notifications
   */
  async addNotificationListener(callback: (notification: any) => void) {
    const notifs = await getNotifications();
    if (!notifs) return { remove: () => {} };

    return notifs.addNotificationReceivedListener(callback);
  },

  /**
   * Listen for notification responses (user taps)
   */
  async addNotificationResponseListener(callback: (response: any) => void) {
    const notifs = await getNotifications();
    if (!notifs) return { remove: () => {} };

    return notifs.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Remove notification listener
   */
  removeNotificationListener(subscription: { remove: () => void }) {
    subscription.remove();
  },

  // ============== UTILITY ==============

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    const notifs = await getNotifications();
    if (!notifs) return;

    await notifs.setBadgeCountAsync(0);
  },

  /**
   * Test notification (for debugging)
   */
  async sendTestNotification(): Promise<void> {
    await this.scheduleNotification(
      '🧪 Test Notification',
      'This is a test notification from INVADE!',
      null,
      NotificationType.ACHIEVEMENT
    );
  },
};

export default NotificationService;
