/**
 * Notification Settings Screen
 * User can control what notifications they receive
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { NotificationService, NotificationType, NotificationPreferences } from '../../services/NotificationService';
import { FeedbackService } from '../../services/FeedbackService';
import { Colors } from '../../theme/Colors';
import { FadeIn } from '../../components/FadeIn';

interface NotificationSettingItem {
  type: NotificationType;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}

const NOTIFICATION_SETTINGS: NotificationSettingItem[] = [
  {
    type: NotificationType.DAILY_REMINDER,
    title: 'Daily Reminders',
    description: 'Get reminded to run at your preferred time',
    icon: 'notifications',
    iconColor: Colors.primary,
  },
  {
    type: NotificationType.STREAK_WARNING,
    title: 'Streak Alerts',
    description: 'Warn when your daily streak is about to end',
    icon: 'flame',
    iconColor: Colors.warning,
  },
  {
    type: NotificationType.ACHIEVEMENT,
    title: 'Achievements',
    description: 'Notify when you unlock new badges and milestones',
    icon: 'trophy',
    iconColor: Colors.success,
  },
  {
    type: NotificationType.ZONE_CAPTURED,
    title: 'Zone Captures',
    description: 'Get notified when you capture a new zone',
    icon: 'flag',
    iconColor: Colors.secondary,
  },
  {
    type: NotificationType.CHALLENGE,
    title: 'Challenges',
    description: 'New challenges and mission updates',
    icon: 'flash',
    iconColor: Colors.primary,
  },
  {
    type: NotificationType.WEEKLY_SUMMARY,
    title: 'Weekly Summary',
    description: 'Weekly recap of your running stats',
    icon: 'stats-chart',
    iconColor: Colors.textSecondary,
  },
  {
    type: NotificationType.FRIEND_ACTIVITY,
    title: 'Friend Activity',
    description: 'When friends complete runs or achievements',
    icon: 'people',
    iconColor: Colors.secondary,
  },
  {
    type: NotificationType.INACTIVITY,
    title: 'Inactivity Reminders',
    description: 'Remind you to run after a few inactive days',
    icon: 'time',
    iconColor: Colors.textMuted,
  },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPermission();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPrefs = await NotificationService.getPreferences();
      setPrefs(savedPrefs);
    } catch (error) {
      console.log('Error loading prefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async () => {
    const granted = await NotificationService.checkPermissions();
    setHasPermission(granted);
  };

  const requestPermission = async () => {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
    if (granted) {
      Alert.alert('✅ Success', 'Notifications enabled!');
    } else {
      Alert.alert(
        '⚠️ Permission Required',
        'Please enable notifications in your device settings to receive alerts.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleMasterSwitch = async (enabled: boolean) => {
    await FeedbackService.buttonPress('light');
    
    if (enabled && !hasPermission) {
      await requestPermission();
      return;
    }

    setSaving(true);
    const updated = { ...prefs!, enabled };
    setPrefs(updated);
    await NotificationService.savePreferences({ enabled });
    setSaving(false);
  };

  const toggleNotificationType = async (type: NotificationType, enabled: boolean) => {
    await FeedbackService.buttonPress('light');
    
    setSaving(true);
    const updated = { ...prefs!, [type]: enabled };
    setPrefs(updated);
    await NotificationService.savePreferences({ [type]: enabled });
    setSaving(false);
  };

  const updateReminderTime = async (hour: number, minute: number) => {
    setSaving(true);
    const updated = { ...prefs!, reminderTime: { hour, minute } };
    setPrefs(updated);
    await NotificationService.savePreferences({ reminderTime: { hour, minute } });
    setSaving(false);
  };

  const sendTestNotification = async () => {
    await FeedbackService.buttonPress('medium');
    await NotificationService.sendTestNotification();
    Alert.alert('🧪 Test Sent', 'Check your notifications!');
  };

  const formatTime = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  };

  if (loading || !prefs) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeIn>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                FeedbackService.lightTap();
                router.back();
              }}
            >
              <Icon name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.placeholder} />
          </View>
        </FadeIn>

        {/* Permission Warning */}
        {!hasPermission && (
          <FadeIn delay={100}>
            <Card style={styles.permissionCard} elevation="small">
              <View style={styles.permissionContent}>
                <View style={styles.permissionIconContainer}>
                  <Icon name="notifications-off" size={32} color={Colors.error} />
                </View>
                <View style={styles.permissionText}>
                  <Text style={styles.permissionTitle}>Notifications Disabled</Text>
                  <Text style={styles.permissionDesc}>
                    Enable notifications to receive run reminders and achievement alerts
                  </Text>
                </View>
              </View>
              <Button
                title="Enable Notifications"
                onPress={requestPermission}
                variant="primary"
                size="small"
                style={styles.permissionButton}
              />
            </Card>
          </FadeIn>
        )}

        {/* Master Toggle */}
        <FadeIn delay={200}>
          <Card style={styles.masterCard} elevation="medium">
            <View style={styles.masterRow}>
              <View style={styles.masterLeft}>
                <View style={[styles.masterIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Icon name="notifications" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.masterTitle}>All Notifications</Text>
                  <Text style={styles.masterSubtitle}>
                    {prefs.enabled ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Switch
                value={prefs.enabled}
                onValueChange={toggleMasterSwitch}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={prefs.enabled ? Colors.primary : Colors.textMuted}
                disabled={saving}
              />
            </View>
          </Card>
        </FadeIn>

        {/* Daily Reminder Time */}
        {prefs.enabled && (
          <FadeIn delay={300}>
            <Card style={styles.timeCard} elevation="small">
              <View style={styles.timeHeader}>
                <Icon name="time" size={20} color={Colors.primary} />
                <Text style={styles.timeTitle}>Daily Reminder Time</Text>
              </View>
              <Text style={styles.timeDescription}>
                When should we remind you to run?
              </Text>
              <View style={styles.timeOptions}>
                {[6, 7, 8, 17, 18, 19].map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeOption,
                      prefs.reminderTime.hour === hour && styles.timeOptionActive,
                    ]}
                    onPress={() => updateReminderTime(hour, 0)}
                    disabled={saving}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        prefs.reminderTime.hour === hour && styles.timeOptionTextActive,
                      ]}
                    >
                      {formatTime(hour, 0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </FadeIn>
        )}

        {/* Individual Notification Types */}
        <FadeIn delay={400}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
        </FadeIn>

        {NOTIFICATION_SETTINGS.map((setting, index) => (
          <FadeIn key={setting.type} delay={500 + index * 50}>
            <Card style={[styles.settingCard, !prefs.enabled && styles.settingDisabled]}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: setting.iconColor + '20' }]}>
                    <Icon name={setting.icon as any} size={20} color={setting.iconColor} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDesc}>{setting.description}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs[setting.type]}
                  onValueChange={(enabled) => toggleNotificationType(setting.type, enabled)}
                  trackColor={{ false: Colors.border, true: setting.iconColor + '50' }}
                  thumbColor={prefs[setting.type] ? setting.iconColor : Colors.textMuted}
                  disabled={!prefs.enabled || saving}
                />
              </View>
            </Card>
          </FadeIn>
        ))}

        {/* Test Button */}
        <FadeIn delay={900}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={sendTestNotification}
            disabled={!prefs.enabled}
          >
            <Icon name="flash" size={20} color={prefs.enabled ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.testText, !prefs.enabled && styles.testTextDisabled]}>
              Send Test Notification
            </Text>
          </TouchableOpacity>
        </FadeIn>

        {/* Info Footer */}
        <FadeIn delay={1000}>
          <Text style={styles.footer}>
            Notifications are scheduled locally on your device. No data is sent to our servers.
          </Text>
        </FadeIn>
      </ScrollView>

      {/* Saving Indicator */}
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  permissionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  permissionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  permissionButton: {
    marginTop: 4,
  },
  masterCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  masterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  masterSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  timeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  timeOptionTextActive: {
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  settingCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingDisabled: {
    opacity: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  testText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  testTextDisabled: {
    color: Colors.textMuted,
  },
  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 24,
    lineHeight: 18,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
});
