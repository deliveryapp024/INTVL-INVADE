/**
 * Badge Component - Achievement badges for profile
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../../components/Icon';
import { Colors } from '../../theme/Colors';

interface BadgeProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export function Badge({ name, icon, color, unlocked }: BadgeProps) {
  return (
    <View style={[styles.container, !unlocked && styles.locked]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon as any} size={24} color={unlocked ? color : Colors.textMuted} />
      </View>
      <Text style={[styles.name, !unlocked && styles.lockedText]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginBottom: 16,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.textMuted,
  },
});
