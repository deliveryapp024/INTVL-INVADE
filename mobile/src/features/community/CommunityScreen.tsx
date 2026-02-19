// src/features/community/CommunityScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing } from '../../theme/Spacing';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme/ThemeContext';
import { FeedbackService } from '../../services/FeedbackService';
import { FadeIn } from '../../components/FadeIn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'feed' | 'clubs' | 'challenges' | 'events' | 'friends';

interface FeedItem {
  id: string;
  userName: string;
  userAvatar?: string;
  activity: string;
  distance: number;
  duration: number;
  pace: string;
  date: string;
  kudos: number;
  comments: number;
  image?: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  members: number;
  activities: number;
  isJoined: boolean;
  image?: string;
  location: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  daysLeft: number;
  participants: number;
  type: 'distance' | 'time' | 'streak';
  reward?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  type: 'run' | 'workshop' | 'social';
  isJoined: boolean;
}

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  lastActivity: string;
  totalDistance: number;
  streakDays: number;
  isOnline: boolean;
}

const MOCK_FEED: FeedItem[] = [
  {
    id: '1',
    userName: 'Rahul Sharma',
    activity: 'Morning Run',
    distance: 5.2,
    duration: 28,
    pace: '5:23',
    date: '2 hours ago',
    kudos: 24,
    comments: 3,
  },
  {
    id: '2',
    userName: 'Priya Patel',
    activity: 'Trail Hike',
    distance: 8.5,
    duration: 95,
    pace: '11:10',
    date: '4 hours ago',
    kudos: 42,
    comments: 8,
  },
  {
    id: '3',
    userName: 'Vikram Malhotra',
    activity: 'Evening 10K',
    distance: 10.0,
    duration: 52,
    pace: '5:12',
    date: '6 hours ago',
    kudos: 67,
    comments: 12,
  },
];

const MOCK_CLUBS: Club[] = [
  {
    id: '1',
    name: 'Mumbai Runners',
    description: 'Largest running community in Mumbai. Weekly group runs at Marine Drive.',
    members: 2450,
    activities: 156,
    isJoined: true,
    location: 'Mumbai',
  },
  {
    id: '2',
    name: 'Trail Blazers Pune',
    description: 'For trail running enthusiasts. Exploring Sahyadri trails every weekend.',
    members: 890,
    activities: 78,
    isJoined: false,
    location: 'Pune',
  },
  {
    id: '3',
    name: 'Marathon Training Squad',
    description: 'Preparing for Mumbai Marathon. Structured training plans and group runs.',
    members: 456,
    activities: 45,
    isJoined: false,
    location: 'Mumbai',
  },
];

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: '100K February',
    description: 'Run 100km this month',
    target: '100 km',
    progress: 65,
    daysLeft: 12,
    participants: 1234,
    type: 'distance',
    reward: 'Gold Medal',
  },
  {
    id: '2',
    title: '7-Day Streak',
    description: 'Run 7 days in a row',
    target: '7 days',
    progress: 85,
    daysLeft: 2,
    participants: 567,
    type: 'streak',
    reward: 'Fire Badge',
  },
  {
    id: '3',
    title: 'Morning Warrior',
    description: 'Run before 7 AM for 10 days',
    target: '10 days',
    progress: 40,
    daysLeft: 18,
    participants: 892,
    type: 'time',
    reward: 'Early Bird Badge',
  },
];

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sunday Long Run',
    date: 'Sun, Feb 23',
    time: '6:00 AM',
    location: 'Marine Drive',
    participants: 45,
    type: 'run',
    isJoined: true,
  },
  {
    id: '2',
    title: 'Pacing Workshop',
    date: 'Sat, Mar 1',
    time: '7:00 AM',
    location: 'BKC',
    participants: 25,
    type: 'workshop',
    isJoined: false,
  },
  {
    id: '3',
    title: 'Post-Run Coffee Social',
    date: 'Sun, Mar 2',
    time: '8:30 AM',
    location: 'Bandra West',
    participants: 30,
    type: 'social',
    isJoined: false,
  },
];

const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Arjun Kumar',
    username: '@arjunruns',
    lastActivity: '2 hours ago',
    totalDistance: 450,
    streakDays: 12,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Neha Gupta',
    username: '@neha.fit',
    lastActivity: '5 hours ago',
    totalDistance: 320,
    streakDays: 5,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Karan Singh',
    username: '@karan.athlete',
    lastActivity: '1 day ago',
    totalDistance: 890,
    streakDays: 45,
    isOnline: true,
  },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  const handleTabChange = async (tab: TabType) => {
    await FeedbackService.selection();
    setActiveTab(tab);
  };

  const renderFeedTab = () => (
    <FlatList
      data={MOCK_FEED}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.feedCard}>
          <View style={styles.feedHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Icon name="person" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {item.userName}
                </Text>
                <Text style={styles.activityType}>{item.activity}</Text>
              </View>
            </View>
            <Text style={styles.timeAgo}>{item.date}</Text>
          </View>

          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Icon name="navigate" size={18} color={Colors.primary} />
              <Text style={styles.statValue}>{item.distance} km</Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="time" size={18} color={Colors.secondary} />
              <Text style={styles.statValue}>{item.duration} min</Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="speedometer" size={18} color={Colors.warning} />
              <Text style={styles.statValue}>{item.pace}/km</Text>
            </View>
          </View>

          <View style={styles.feedActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="heart" size={20} color={Colors.textMuted} />
              <Text style={styles.actionText}>{item.kudos}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="chatbubble" size={20} color={Colors.textMuted} />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="share" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderClubsTab = () => (
    <FlatList
      data={MOCK_CLUBS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.clubCard}>
          <View style={styles.clubHeader}>
            <View style={styles.clubIcon}>
              <Icon name="people" size={28} color={Colors.primary} />
            </View>
            <View style={styles.clubInfo}>
              <Text style={[styles.clubName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {item.name}
              </Text>
              <Text style={styles.clubLocation}>{item.location}</Text>
            </View>
          </View>

          <Text style={[styles.clubDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {item.description}
          </Text>

          <View style={styles.clubStats}>
            <View style={styles.clubStat}>
              <Icon name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.clubStatText}>{item.members.toLocaleString()} members</Text>
            </View>
            <View style={styles.clubStat}>
              <Icon name="flash" size={16} color={Colors.textSecondary} />
              <Text style={styles.clubStatText}>{item.activities} activities</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinClubButton, item.isJoined && styles.joinedClubButton]}
          >
            <Text style={[styles.joinClubText, item.isJoined && styles.joinedClubText]}>
              {item.isJoined ? 'Joined' : 'Join Club'}
            </Text>
          </TouchableOpacity>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderChallengesTab = () => (
    <FlatList
      data={MOCK_CHALLENGES}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIcon}>
              <Icon 
                name={item.type === 'distance' ? 'navigate' : item.type === 'time' ? 'time' : 'flame'} 
                size={24} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={[styles.challengeTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {item.title}
              </Text>
              <Text style={styles.challengeTarget}>{item.description}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${item.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.progress}% • {item.daysLeft} days left</Text>
          </View>

          <View style={styles.challengeFooter}>
            <View style={styles.challengeStats}>
              <Icon name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.challengeStatText}>{item.participants.toLocaleString()} participants</Text>
            </View>
            {item.reward && (
              <View style={styles.rewardBadge}>
                <Icon name="trophy" size={14} color={Colors.warning} />
                <Text style={styles.rewardText}>{item.reward}</Text>
              </View>
            )}
          </View>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderEventsTab = () => (
    <FlatList
      data={MOCK_EVENTS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View style={[styles.eventTypeIcon, { backgroundColor: getEventTypeColor(item.type) }]}>
              <Icon 
                name={item.type === 'run' ? 'navigate' : item.type === 'workshop' ? 'create' : 'chatbubble'} 
                size={18} 
                color="#FFF" 
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={[styles.eventTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {item.title}
              </Text>
              <Text style={styles.eventDate}>{item.date} • {item.time}</Text>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Icon name="location" size={16} color={Colors.textSecondary} />
              <Text style={styles.eventDetailText}>{item.location}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Icon name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.eventDetailText}>{item.participants} attending</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.eventJoinButton, item.isJoined && styles.eventJoinedButton]}
          >
            <Text style={[styles.eventJoinText, item.isJoined && styles.eventJoinedText]}>
              {item.isJoined ? 'Joined' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderFriendsTab = () => (
    <FlatList
      data={MOCK_FRIENDS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.friendCard}>
          <View style={styles.friendHeader}>
            <View style={styles.friendAvatar}>
              <Icon name="person" size={24} color={Colors.primary} />
              {item.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.friendInfo}>
              <Text style={[styles.friendName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {item.name}
              </Text>
              <Text style={styles.friendUsername}>{item.username}</Text>
            </View>
          </View>

          <View style={styles.friendStats}>
            <View style={styles.friendStat}>
              <Icon name="navigate" size={14} color={Colors.primary} />
              <Text style={styles.friendStatText}>{item.totalDistance} km</Text>
            </View>
            <View style={styles.friendStat}>
              <Icon name="flame" size={14} color={Colors.warning} />
              <Text style={styles.friendStatText}>{item.streakDays} day streak</Text>
            </View>
            <View style={styles.friendStat}>
              <Icon name="time" size={14} color={Colors.textSecondary} />
              <Text style={styles.friendStatText}>{item.lastActivity}</Text>
            </View>
          </View>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'run': return Colors.primary;
      case 'workshop': return Colors.secondary;
      case 'social': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Community
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Icon name="add" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
      >
        {(['feed', 'clubs', 'challenges', 'events', 'friends'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'clubs' && renderClubsTab()}
        {activeTab === 'challenges' && renderChallengesTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'friends' && renderFriendsTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    fontWeight: '800',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.md,
  },
  // Feed
  feedCard: {
    marginBottom: Spacing.md,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...Typography.body,
    fontWeight: '700',
  },
  activityType: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  timeAgo: {
    ...Typography.captionSmall,
    color: Colors.textMuted,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  activityStat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text,
  },
  feedActions: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  // Clubs
  clubCard: {
    marginBottom: Spacing.md,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  clubIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: 2,
  },
  clubLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  clubDescription: {
    ...Typography.body,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  clubStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  clubStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubStatText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  joinClubButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinedClubButton: {
    backgroundColor: Colors.success + '20',
  },
  joinClubText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  joinedClubText: {
    color: Colors.success,
  },
  // Challenges
  challengeCard: {
    marginBottom: Spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: 2,
  },
  challengeTarget: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengeStatText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  rewardText: {
    ...Typography.captionSmall,
    color: Colors.warning,
    fontWeight: '700',
  },
  // Events
  eventCard: {
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  eventTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: 2,
  },
  eventDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  eventDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  eventJoinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  eventJoinedButton: {
    backgroundColor: Colors.success + '20',
  },
  eventJoinText: {
    ...Typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  eventJoinedText: {
    color: Colors.success,
  },
  // Friends
  friendCard: {
    marginBottom: Spacing.md,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  friendAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...Typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  friendUsername: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  friendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
  },
  friendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatText: {
    ...Typography.captionSmall,
    color: Colors.text,
    fontWeight: '600',
  },
});
