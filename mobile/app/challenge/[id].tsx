// app/challenge/[id].tsx - Challenge Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'city_vs_city' | 'club' | 'community';
  category: 'distance' | 'streak' | 'time' | 'elevation' | 'zones';
  goal: number;
  goalUnit: string;
  startDate: string;
  endDate: string;
  progress: number;
  currentValue: number;
  participants: number;
  xpReward: number;
  badgeReward?: string;
  isJoined: boolean;
  rank?: number;
}

const LEADERBOARD = [
  { rank: 1, name: 'Rahul S.', avatar: 'R', value: 45.2, isCurrentUser: false },
  { rank: 2, name: 'Priya M.', avatar: 'P', value: 42.8, isCurrentUser: false },
  { rank: 3, name: 'Vikram K.', avatar: 'V', value: 38.5, isCurrentUser: false },
  { rank: 4, name: 'You', avatar: 'Y', value: 32.0, isCurrentUser: true },
  { rank: 5, name: 'Neha G.', avatar: 'N', value: 28.3, isCurrentUser: false },
];

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  
  const [challenge] = useState<Challenge>({
    id: '1',
    name: 'February 50K Challenge',
    description: 'Run 50 kilometers in February. Every kilometer counts! Track your progress and compete with friends to see who can reach the goal first.',
    type: 'individual',
    category: 'distance',
    goal: 50,
    goalUnit: 'km',
    startDate: 'Feb 1',
    endDate: 'Feb 28',
    progress: 64,
    currentValue: 32,
    participants: 1234,
    xpReward: 500,
    badgeReward: '50K Master',
    isJoined: true,
    rank: 4,
  });

  const [isJoined, setIsJoined] = useState(challenge.isJoined);

  const handleJoin = async () => {
    await FeedbackService.buttonPress('medium');
    setIsJoined(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'distance': return 'navigate';
      case 'streak': return 'flame';
      case 'time': return 'time';
      case 'elevation': return 'trending-up';
      case 'zones': return 'flag';
      default: return 'trophy';
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { backgroundColor: '#FFD700', color: '#000' };
      case 2: return { backgroundColor: '#C0C0C0', color: '#000' };
      case 3: return { backgroundColor: '#CD7F32', color: '#FFF' };
      default: return { backgroundColor: Colors.surface, color: Colors.text };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share" size={22} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Challenge Banner */}
        <View style={styles.banner}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
            <Icon name={getCategoryIcon(challenge.category)} size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.challengeName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            {challenge.name}
          </Text>
          <Text style={[styles.challengeDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {challenge.description}
          </Text>
        </View>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              Your Progress
            </Text>
            <Text style={styles.progressPercent}>{challenge.progress}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${challenge.progress}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={[styles.progressValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              {challenge.currentValue} / {challenge.goal} {challenge.goalUnit}
            </Text>
            <Text style={styles.daysLeft}>8 days remaining</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Icon name="people" size={24} color={Colors.primary} />
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              {challenge.participants.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Participants</Text>
          </Card>

          <Card style={styles.statCard}>
            <Icon name="trophy" size={24} color={Colors.warning} />
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              #{challenge.rank}
            </Text>
            <Text style={styles.statLabel}>Your Rank</Text>
          </Card>

          <Card style={styles.statCard}>
            <Icon name="star" size={24} color={Colors.success} />
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              +{challenge.xpReward}
            </Text>
            <Text style={styles.statLabel}>XP Reward</Text>
          </Card>
        </View>

        {/* Rewards */}
        <Card style={styles.rewardsCard}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Rewards
          </Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: Colors.warning + '20' }]}>
                <Icon name="trophy" size={24} color={Colors.warning} />
              </View>
              <Text style={[styles.rewardName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {challenge.badgeReward}
              </Text>
              <Text style={styles.rewardType}>Badge</Text>
            </View>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, { backgroundColor: Colors.success + '20' }]}>
                <Icon name="sparkles" size={24} color={Colors.success} />
              </View>
              <Text style={[styles.rewardName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                +{challenge.xpReward}
              </Text>
              <Text style={styles.rewardType}>XP Points</Text>
            </View>
          </View>
        </Card>

        {/* Leaderboard */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E', marginTop: Spacing.lg }]}>
          Leaderboard
        </Text>

        <Card style={styles.leaderboardCard}>
          {LEADERBOARD.map((user, index) => {
            const rankStyle = getRankStyle(user.rank);
            return (
              <View 
                key={index} 
                style={[
                  styles.leaderboardRow,
                  user.isCurrentUser && styles.currentUserRow
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}>
                  <Text style={[styles.rankText, { color: rankStyle.color }]}>
                    {user.rank}
                  </Text>
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user.avatar}</Text>
                </View>
                <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {user.name}
                </Text>
                <Text style={styles.userValue}>
                  {user.value} km
                </Text>
              </View>
            );
          })}
        </Card>

        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllButtonText}>View Full Leaderboard</Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {!isJoined ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingHorizontal: Spacing.lg },
  banner: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  challengeName: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  challengeDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  progressCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  daysLeft: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rewardsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  rewardType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  leaderboardCard: {
    padding: Spacing.lg,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  currentUserRow: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '800',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  userValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  viewAllButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
