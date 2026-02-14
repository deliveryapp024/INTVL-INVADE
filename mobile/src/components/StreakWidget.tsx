/**
 * Streak Widget - Compact version for Home Screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Colors } from '../theme/Colors';

interface StreakWidgetProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakWidget({ currentStreak, bestStreak }: StreakWidgetProps) {
  const isRecord = currentStreak >= bestStreak;
  
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flameContainer}>
          <Icon name="flame" size={28} color={isRecord ? Colors.warning : Colors.primary} />
          {isRecord && (
            <View style={styles.recordBadge}>
              <Text style={styles.recordText}>RECORD!</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>
      </View>
      <Text style={styles.bestLabel}>Best: {bestStreak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flameContainer: {
    position: 'relative',
  },
  recordBadge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: Colors.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  recordText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFF',
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  bestLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
