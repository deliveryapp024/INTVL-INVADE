// app/goals/index.tsx - Weekly Goals Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

interface Goal {
  type: 'distance' | 'runs' | 'zones' | 'time';
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: string;
  color: string;
}

const WEEKLY_GOALS: Goal[] = [
  { type: 'distance', title: 'Distance', current: 32, target: 50, unit: 'km', icon: 'navigate', color: Colors.primary },
  { type: 'runs', title: 'Runs', current: 3, target: 5, unit: 'runs', icon: 'run', color: Colors.secondary },
  { type: 'zones', title: 'Zones', current: 8, target: 15, unit: 'zones', icon: 'flag', color: Colors.success },
  { type: 'time', title: 'Active Time', current: 180, target: 300, unit: 'min', icon: 'time', color: Colors.warning },
];

const PREVIOUS_WEEKS = [
  { week: 'Feb 10-16', distance: 45, target: 40, completed: true },
  { week: 'Feb 3-9', distance: 38, target: 40, completed: false },
  { week: 'Jan 27-Feb 2', distance: 52, target: 45, completed: true },
];

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [goals] = useState<Goal[]>(WEEKLY_GOALS);

  const getProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return Colors.success;
    if (progress >= 50) return Colors.warning;
    return Colors.primary;
  };

  const handleEditGoals = async () => {
    await FeedbackService.buttonPress('medium');
    // Navigate to edit goals screen
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Weekly Goals
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditGoals}>
          <Icon name="create" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Week Info */}
        <View style={styles.weekInfo}>
          <Text style={[styles.weekLabel, { color: isDark ? '#888888' : '#666666' }]}>
            This Week
          </Text>
          <Text style={[styles.weekRange, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Feb 17 - Feb 23
          </Text>
          <Text style={[styles.daysLeft, { color: isDark ? '#888888' : '#666666' }]}>
            5 days remaining
          </Text>
        </View>

        {/* Overall Progress */}
        <Card style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={[styles.overallTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              Overall Progress
            </Text>
            <View style={styles.overallBadge}>
              <Text style={styles.overallBadgeText}>3/4 Goals</Text>
            </View>
          </View>
          <View style={styles.overallProgressBar}>
            <View style={[styles.overallProgressFill, { width: '75%' }]} />
          </View>
          <Text style={[styles.overallPercent, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            75%
          </Text>
        </Card>

        {/* Individual Goals */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Your Goals
        </Text>

        {goals.map((goal, index) => {
          const progress = getProgress(goal.current, goal.target);
          const isCompleted = progress >= 100;
          
          return (
            <Card key={goal.type} style={[styles.goalCard, isCompleted && styles.completedCard]}>
              <View style={styles.goalHeader}>
                <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                  <Icon name={goal.icon} size={24} color={goal.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                    {goal.title}
                  </Text>
                  <Text style={styles.goalTarget}>
                    Target: {goal.target} {goal.unit}
                  </Text>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Icon name="checkmark-circle" size={24} color={Colors.success} />
                  </View>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${progress}%`,
                        backgroundColor: isCompleted ? Colors.success : goal.color
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={[styles.currentValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                    {goal.current} {goal.unit}
                  </Text>
                  <Text style={[styles.progressPercent, { color: goal.color }]}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              </View>

              {isCompleted && (
                <View style={styles.rewardRow}>
                  <Icon name="trophy" size={16} color={Colors.warning} />
                  <Text style={styles.rewardText}>+50 XP Earned!</Text>
                </View>
              )}
            </Card>
          );
        })}

        {/* Previous Weeks */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E', marginTop: Spacing.lg }]}>
          Previous Weeks
        </Text>

        {PREVIOUS_WEEKS.map((week, index) => (
          <Card key={index} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View>
                <Text style={[styles.historyWeek, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {week.week}
                </Text>
                <Text style={styles.historyDistance}>
                  {week.distance} / {week.target} km
                </Text>
              </View>
              <View style={[styles.historyBadge, week.completed ? styles.completedBadge2 : styles.missedBadge]}>
                <Icon 
                  name={week.completed ? "checkmark" : "close"} 
                  size={16} 
                  color={week.completed ? Colors.success : Colors.error} 
                />
                <Text style={[styles.historyBadgeText, { color: week.completed ? Colors.success : Colors.error }]}>
                  {week.completed ? 'Completed' : 'Missed'}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Icon name="bulb" size={24} color={Colors.warning} />
            <Text style={[styles.tipsTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              Tips to Reach Your Goals
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Break your distance goal into smaller daily targets
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Join group runs to stay motivated
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Track your progress daily in the app
            </Text>
          </View>
        </Card>

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingHorizontal: Spacing.lg },
  weekInfo: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  weekLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weekRange: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  daysLeft: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  overallCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  overallBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overallBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  overallProgressBar: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  overallPercent: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  goalCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  goalTarget: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedBadge: {
    marginLeft: Spacing.sm,
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rewardText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '600',
  },
  historyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyWeek: {
    fontSize: 15,
    fontWeight: '600',
  },
  historyDistance: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge2: {
    backgroundColor: Colors.success + '20',
  },
  missedBadge: {
    backgroundColor: Colors.error + '20',
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipsCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
