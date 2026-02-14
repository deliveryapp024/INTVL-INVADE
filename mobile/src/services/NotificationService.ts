/**
 * Notification Service
 * Local push notifications - no server required!
 * All notifications are scheduled and managed on the device
 */

import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  reminderTime: { hour: number; minute: number }; // Daily reminder time
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  [NotificationType.DAILY_REMINDER]: true,
  [NotificationType.STREAK_WARNING]: true,
  [NotificationType.ACHIEVEMENT]: true,
  [NotificationType.ZONE_CAPTURED]: true,
  [NotificationType.FRIEND_ACTIVITY]: false, // Off by default
  [NotificationType.WEEKLY_SUMMARY]: true,
  [NotificationType.CHALLENGE]: true,
  [NotificationType.INACTIVITY]: true,
  reminderTime: { hour: 7, minute: 0 }, // 7:00 AM default
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

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
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
    const { status } = await Notifications.getPermissionsAsync();
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
    trigger: Notifications.NotificationTriggerInput,
    type: NotificationType,
    data?: Record<string, any>
  ): Promise<string | null> {
    const prefs = await this.getPreferences();
    
    // Check if this notification type is enabled
    if (!prefs.enabled || !prefs[type]) {
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
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
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  // ============== SMART NOTIFICATION SCHEDULING ==============

  /**
   * Schedule daily run reminder
   */
  async scheduleDailyReminder(hour: number = 7, minute: number = 0): Promise<void> {
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
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
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
    if (currentStreak < 2) return; // Only warn if streak is worth saving

    await this.cancelNotificationsByType(NotificationType.STREAK_WARNING);

    await this.scheduleNotification(
      '🔥 Streak in Danger!',
      `Your ${currentStreak}-day streak ends tonight! Run now to save it!`,
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19, // 7 PM
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
      null, // Immediate
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
      null, // Immediate
      NotificationType.ZONE_CAPTURED,
      { zoneName }
    );
  },

  /**
   * Schedule weekly summary
   */
  async scheduleWeeklySummary(totalRuns: number, totalDistance: number): Promise<void> {
    await this.scheduleNotification(
      '📊 Weekly Summary',
      `You completed ${totalRuns} runs this week covering ${(totalDistance / 1000).toFixed(1)}km! Amazing!`,
      {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Monday
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
      null, // Immediate
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
        type: Notifications.SchedulableTriggerInputTypes.DATE,
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
      if (notification.content.data?.type === type) {
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
      await this.scheduleWeeklySummary(0, 0); // Will be updated with real data
    }
  },

  // ============== NOTIFICATION LISTENERS ==============

  /**
   * Listen for incoming notifications
   */
  addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Listen for notification responses (user taps)
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Remove notification listener
   */
  removeNotificationListener(subscription: Notifications.Subscription) {
    subscription.remove();
  },

  // ============== UTILITY ==============

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
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
