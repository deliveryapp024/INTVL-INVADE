/**
 * Profile Screen - User Profile & Settings
 * Updated with Feedback Toggle and all new features
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { FeedbackToggle } from '../../components/FeedbackToggle';
import { Badge } from './Badge';
import { useTheme } from '../../theme/ThemeContext';
import { FeedbackService } from '../../services/FeedbackService';
import { ShareService } from '../../services/ShareService';
import { CacheService } from '../../services/CacheService';
import { Colors } from '../../theme/Colors';
import { FadeIn, ScaleIn } from '../../components/FadeIn';
import {
  AnimatedProgressBar,
  PressableScale,
  Animated,
} from '../../components/animations';

// Mock user data
const USER = {
  id: '1',
  name: 'Champion Runner',
  username: '@champion_runner',
  avatar: null,
  level: 12,
  xp: 3450,
  xpToNext: 5000,
  totalRuns: 47,
  totalDistance: 345.2, // km
  totalZones: 23,
  totalTime: 182, // hours
  badges: [
    { id: '1', name: 'Early Bird', icon: 'time', color: '#F39C12', unlocked: true },
    { id: '2', name: 'Zone Master', icon: 'flag', color: '#6C5CE7', unlocked: true },
    { id: '3', name: 'Marathoner', icon: 'run-fast', color: '#00B894', unlocked: true },
    { id: '4', name: 'Speed Demon', icon: 'flash', color: '#E17055', unlocked: false },
    { id: '5', name: 'Social Star', icon: 'people', color: '#0984E3', unlocked: true },
    { id: '6', name: 'Century Club', icon: 'trophy', color: '#FDCB6E', unlocked: false },
  ],
  achievements: [
    { id: '1', title: 'First Capture', description: 'Capture your first zone', completed: true, date: '2024-01-15' },
    { id: '2', title: 'Zone Streak', description: 'Capture 5 zones in a row', completed: true, date: '2024-01-20' },
    { id: '3', title: 'Speed King', description: 'Run under 4 min/km pace', completed: false },
    { id: '4', title: 'Marathon Ready', description: 'Run 42km total distance', completed: true, date: '2024-02-01' },
  ],
  stats: {
    thisWeek: { distance: 23.5, time: 145, zones: 4 },
    thisMonth: { distance: 98.3, time: 620, zones: 12 },
    allTime: { distance: 345.2, time: 182 * 60, zones: 23 },
  },
  streaks: {
    current: 7,
    best: 14,
  },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'achievements'>('stats');
  const [autoStart, setAutoStart] = useState(false);
  const [voiceCoach, setVoiceCoach] = useState(true);

  const handleShareProfile = async () => {
    await FeedbackService.buttonPress('medium');
    await ShareService.shareReferral('CHAMPION2024');
  };

  const handleEditProfile = async () => {
    await FeedbackService.buttonPress('light');
    Alert.alert('Edit Profile', 'This feature is coming soon!');
  };

  const handleClearCache = async () => {
    await FeedbackService.buttonPress('medium');
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => FeedbackService.lightTap() },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await CacheService.clear();
            await FeedbackService.success();
            Alert.alert('Cache Cleared', 'All cached data has been cleared.');
          },
        },
      ]
    );
  };

  const progress = (USER.xp / USER.xpToNext) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
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
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleEditProfile}
            >
              <Icon name="create" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Profile Card */}
        <ScaleIn delay={100}>
          <Card style={styles.profileCard} elevation="large">
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icon name="person" size={40} color={Colors.primary} />
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>LVL {USER.level}</Text>
              </View>
            </View>

            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userHandle}>{USER.username}</Text>

            {/* XP Progress */}
            <View style={styles.xpContainer}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpLabel}>XP Progress</Text>
                <Text style={styles.xpValue}>{USER.xp} / {USER.xpToNext}</Text>
              </View>
              <AnimatedProgressBar
                progress={progress}
                duration={1500}
                delay={300}
                height={8}
                backgroundColor={Colors.border}
                fillColor={Colors.primary}
                shimmer={true}
              />
            </View>

            {/* Streak Badge */}
            <View style={styles.streakContainer}>
              <Icon name="flame" size={20} color={Colors.warning} />
              <Text style={styles.streakText}>{USER.streaks.current} Day Streak</Text>
              <Text style={styles.bestStreak}>(Best: {USER.streaks.best})</Text>
            </View>
          </Card>
        </ScaleIn>

        {/* Stats Grid */}
        <ScaleIn delay={200}>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Icon name="run-fast" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{USER.totalRuns}</Text>
              <Text style={styles.statLabel}>Runs</Text>
            </Card>
            <Card style={styles.statCard}>
              <Icon name="map" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{USER.totalDistance.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Km</Text>
            </Card>
            <Card style={styles.statCard}>
              <Icon name="flag" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{USER.totalZones}</Text>
              <Text style={styles.statLabel}>Zones</Text>
            </Card>
            <Card style={styles.statCard}>
              <Icon name="time" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{USER.totalTime}h</Text>
              <Text style={styles.statLabel}>Time</Text>
            </Card>
          </View>
        </ScaleIn>

        {/* Tabs */}
        <FadeIn delay={300}>
          <View style={styles.tabContainer}>
            {(['stats', 'badges', 'achievements'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={async () => {
                  await FeedbackService.selection();
                  setActiveTab(tab);
                }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeIn>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'stats' && (
            <FadeIn>
              <Card style={styles.statsCard}>
                <Text style={styles.sectionTitle}>This Week</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{USER.stats.thisWeek.distance} km</Text>
                    <Text style={styles.statItemLabel}>Distance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{USER.stats.thisWeek.time} min</Text>
                    <Text style={styles.statItemLabel}>Time</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{USER.stats.thisWeek.zones}</Text>
                    <Text style={styles.statItemLabel}>Zones</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>This Month</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{USER.stats.thisMonth.distance} km</Text>
                    <Text style={styles.statItemLabel}>Distance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{Math.floor(USER.stats.thisMonth.time / 60)}h</Text>
                    <Text style={styles.statItemLabel}>Time</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>{USER.stats.thisMonth.zones}</Text>
                    <Text style={styles.statItemLabel}>Zones</Text>
                  </View>
                </View>
              </Card>
            </FadeIn>
          )}

          {activeTab === 'badges' && (
            <View style={styles.badgesGrid}>
              {USER.badges.map((badge, index) => (
                <ScaleIn key={badge.id} delay={index * 50}>
                  <Badge {...badge} />
                </ScaleIn>
              ))}
            </View>
          )}

          {activeTab === 'achievements' && (
            <View>
              {USER.achievements.map((achievement, index) => (
                <ScaleIn key={achievement.id} delay={index * 100}>
                  <Card style={[styles.achievementCard, ...(achievement.completed ? [] : [styles.achievementLocked])]}>
                    <View style={styles.achievementLeft}>
                      <View style={[styles.achievementIcon, achievement.completed && { backgroundColor: Colors.success + '20' }]}>
                        <Icon
                          name={achievement.completed ? 'checkmark-circle' : 'lock-closed'}
                          size={24}
                          color={achievement.completed ? Colors.success : Colors.textMuted}
                        />
                      </View>
                      <View>
                        <Text style={styles.achievementTitle}>{achievement.title}</Text>
                        <Text style={styles.achievementDesc}>{achievement.description}</Text>
                        {achievement.completed && achievement.date && (
                          <Text style={styles.achievementDate}>Unlocked {achievement.date}</Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </ScaleIn>
              ))}
            </View>
          )}
        </View>

        {/* Feedback & Sound Settings */}
        <FadeIn delay={400}>
          <FeedbackToggle />
        </FadeIn>

        {/* Settings */}
        <FadeIn delay={500}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <Card style={styles.settingsCard}>
              {/* Dark Mode */}
              <TouchableOpacity style={styles.settingRow} onPress={async () => {
                await FeedbackService.buttonPress('light');
                toggle();
              }}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? Colors.primary + '20' : Colors.border }]}>
                    <Icon name={isDark ? "moon" : "sunny"} size={22} color={isDark ? Colors.primary : Colors.warning} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Dark Mode</Text>
                    <Text style={styles.settingSubtitle}>{isDark ? 'On' : 'Off'}</Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={async () => {
                    await FeedbackService.buttonPress('light');
                    toggle();
                  }}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={isDark ? Colors.primary : Colors.textMuted}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Notifications */}
              <TouchableOpacity 
                style={styles.settingRow} 
                onPress={async () => {
                  await FeedbackService.buttonPress('light');
                  router.push('/profile/notifications');
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.secondary + '20' }]}>
                    <Icon name="notifications" size={22} color={Colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingSubtitle}>Manage push notifications</Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Voice Coach */}
              <TouchableOpacity style={styles.settingRow} onPress={async () => {
                await FeedbackService.buttonPress('light');
                setVoiceCoach(!voiceCoach);
              }}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.success + '20' }]}>
                    <Icon name="volume-high" size={22} color={Colors.success} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Voice Coach</Text>
                    <Text style={styles.settingSubtitle}>Audio guidance during runs</Text>
                  </View>
                </View>
                <Switch
                  value={voiceCoach}
                  onValueChange={async (val) => {
                    await FeedbackService.buttonPress('light');
                    setVoiceCoach(val);
                  }}
                  trackColor={{ false: Colors.border, true: Colors.success + '50' }}
                  thumbColor={voiceCoach ? Colors.success : Colors.textMuted}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Clear Cache */}
              <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: Colors.error + '20' }]}>
                    <Icon name="trash" size={22} color={Colors.error} />
                  </View>
                  <View>
                    <Text style={[styles.settingTitle, { color: Colors.error }]}>Clear Cache</Text>
                    <Text style={styles.settingSubtitle}>Free up storage space</Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </Card>
          </View>
        </FadeIn>

        {/* Share Button */}
        <FadeIn delay={600}>
          <PressableScale onPress={handleShareProfile}>
            <Button
              title="Share Profile"
              onPress={handleShareProfile}
              variant="primary"
              icon={<Icon name="share" size={20} color="#FFF" />}
              style={styles.shareButton}
            />
          </PressableScale>
        </FadeIn>

        {/* Version */}
        <FadeIn delay={700}>
          <Text style={styles.version}>INVADE v1.0.0</Text>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 50,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  levelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  xpContainer: {
    width: '100%',
    marginBottom: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  xpValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginLeft: 8,
  },
  bestStreak: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '23%',
    margin: '1%',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsCard: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statItemLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    marginBottom: 12,
    padding: 16,
  },
  achievementLocked: {
    opacity: 0.7,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  achievementDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 11,
    color: Colors.success,
    marginTop: 4,
  },
  settingsCard: {
    overflow: 'hidden',
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
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  shareButton: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 16,
  },
});
