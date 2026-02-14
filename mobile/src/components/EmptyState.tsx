/**
 * EmptyState Component - Beautiful empty states for lists and screens
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, IconName } from './Icon';
import { Button } from './Button';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';
import { FadeIn, ScaleIn } from './animations';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <FadeIn>
      <View style={styles.container}>
        <ScaleIn delay={100}>
          <View style={styles.iconContainer}>
            <Icon name={icon} size={64} color={Colors.primary} />
          </View>
        </ScaleIn>

        <ScaleIn delay={200}>
          <Text style={styles.title}>{title}</Text>
        </ScaleIn>

        <ScaleIn delay={300}>
          <Text style={styles.description}>{description}</Text>
        </ScaleIn>

        {(actionLabel || secondaryActionLabel) && (
          <FadeIn delay={400}>
            <View style={styles.actions}>
              {actionLabel && onAction && (
                <Button
                  title={actionLabel}
                  onPress={onAction}
                  variant="primary"
                  style={styles.primaryButton}
                />
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <TouchableOpacity onPress={onSecondaryAction} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          </FadeIn>
        )}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    minHeight: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 280,
    lineHeight: 24,
  },
  actions: {
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    minWidth: 200,
    marginBottom: Spacing.md,
  },
  secondaryButton: {
    paddingVertical: Spacing.sm,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});

// Preset empty states for common scenarios
export const EmptyStates = {
  // No friends yet
  noFriends: (onAction?: () => void) => ({
    icon: 'people' as IconName,
    title: 'No Friends Yet',
    description: 'Invite your friends to join INVADE and compete together!',
    actionLabel: 'Invite Friends',
    onAction,
  }),

  // No squads
  noSquads: (onAction?: () => void) => ({
    icon: 'shield' as IconName,
    title: 'No Squads Yet',
    description: 'Create or join a squad to compete with other groups!',
    actionLabel: 'Create Squad',
    onAction,
  }),

  // No runs
  noRuns: (onAction?: () => void) => ({
    icon: 'run-fast' as IconName,
    title: 'No Runs Yet',
    description: 'Start your first run to capture zones and compete!',
    actionLabel: 'Start Running',
    onAction,
  }),

  // No zones
  noZones: () => ({
    icon: 'map' as IconName,
    title: 'No Zones Found',
    description: 'No zones in your area yet. Come back later!',
  }),

  // No notifications
  noNotifications: () => ({
    icon: 'notifications-off' as IconName,
    title: 'No Notifications',
    description: 'You\'re all caught up! Check back later.',
  }),

  // No achievements
  noAchievements: () => ({
    icon: 'medal' as IconName,
    title: 'No Achievements Yet',
    description: 'Complete runs and challenges to earn achievements!',
  }),

  // No internet
  noInternet: (onRetry?: () => void) => ({
    icon: 'cloud-offline' as IconName,
    title: 'No Connection',
    description: 'Check your internet connection and try again.',
    actionLabel: 'Retry',
    onAction: onRetry,
  }),

  // Search empty
  searchEmpty: (searchQuery?: string) => ({
    icon: 'search' as IconName,
    title: searchQuery ? `No results for "${searchQuery}"` : 'Search',
    description: searchQuery 
      ? 'Try a different search term' 
      : 'Search for friends, zones, or squads',
  }),

  // Error state
  error: (onRetry?: () => void) => ({
    icon: 'alert-circle' as IconName,
    title: 'Something Went Wrong',
    description: 'We couldn\'t load the data. Please try again.',
    actionLabel: 'Retry',
    onAction: onRetry,
  }),
};

export default EmptyState;
