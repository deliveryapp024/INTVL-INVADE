import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/Colors';
import { Typography } from '../theme/Typography';
import { Spacing } from '../theme/Spacing';

type ZoneStatus = 'mine' | 'opponent' | 'neutral' | 'contested' | 'capturing';

interface ZoneBadgeProps {
  status: ZoneStatus;
  count?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

const statusConfig = {
  mine: {
    color: Colors.territory.mine,
    bgColor: Colors.territory.mineTransparent,
    label: 'Captured',
    icon: '👑',
  },
  opponent: {
    color: Colors.territory.opponent,
    bgColor: Colors.territory.opponentTransparent,
    label: 'Opponent',
    icon: '⚔️',
  },
  neutral: {
    color: Colors.territory.neutral,
    bgColor: Colors.territory.neutralTransparent,
    label: 'Available',
    icon: '🎯',
  },
  contested: {
    color: Colors.territory.contested,
    bgColor: Colors.territory.contestedTransparent,
    label: 'Contested',
    icon: '🔥',
  },
  capturing: {
    color: Colors.territory.capturing,
    bgColor: 'rgba(0, 200, 83, 0.15)',
    label: 'Capturing...',
    icon: '⚡',
  },
};

export function ZoneBadge({ status, count, label, size = 'medium' }: ZoneBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: config.bgColor },
      styles[size],
    ]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }, styles[`${size}Label`]]}>
        {displayLabel}
      </Text>
      {count !== undefined && (
        <View style={[styles.countBadge, { backgroundColor: config.color }]}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  large: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: 11,
  },
  mediumLabel: {
    fontSize: 13,
  },
  largeLabel: {
    fontSize: 15,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  countText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
