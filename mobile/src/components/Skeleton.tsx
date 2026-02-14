/**
 * Skeleton - Loading placeholder with shimmer effect
 * Uses React Native's built-in Animated API
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[styles.container, { width: width as any, height, borderRadius }, style]}>
      <View style={[styles.base, { width: width as any, height, borderRadius }]} />
      <Animated.View
        style={[
          styles.shimmer,
          {
            height,
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      />
    </View>
  );
}

// Pre-built skeleton layouts
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={20} />
        <Skeleton width="40%" height={16} style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}

export function StatsSkeleton() {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Skeleton width={50} height={32} />
        <Skeleton width={60} height={14} style={{ marginTop: Spacing.xs }} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={50} height={32} />
        <Skeleton width={60} height={14} style={{ marginTop: Spacing.xs }} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={50} height={32} />
        <Skeleton width={60} height={14} style={{ marginTop: Spacing.xs }} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.borderLight,
  },
  base: {
    backgroundColor: Colors.borderLight,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.5)',
    opacity: 0.3,
  },
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
});
