/**
 * Loading States Components
 * Skeletons, spinners, and loading overlays
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '../theme/Colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading placeholder with shimmer effect
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[{ width: width as any, height, borderRadius, overflow: 'hidden', backgroundColor: Colors.border }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(255,255,255,0.3)',
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

/**
 * Card skeleton for lists
 */
export function CardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.cardText}>
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={100} style={{ marginTop: 12 }} />
    </View>
  );
}

/**
 * Stats skeleton for dashboard
 */
export function StatsSkeleton() {
  return (
    <View style={styles.statsSkeleton}>
      <View style={styles.statItem}>
        <Skeleton width={60} height={32} />
        <Skeleton width={40} height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={60} height={32} />
        <Skeleton width={40} height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statItem}>
        <Skeleton width={60} height={32} />
        <Skeleton width={40} height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/**
 * List skeleton with multiple items
 */
interface ListSkeletonProps {
  count?: number;
}

export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

/**
 * Map loading placeholder
 */
export function MapSkeleton() {
  return (
    <View style={styles.mapSkeleton}>
      <View style={styles.mapGrid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.mapBlock} />
        ))}
      </View>
      <View style={styles.mapPulse} />
    </View>
  );
}

/**
 * Full screen loading overlay
 */
interface FullScreenLoaderProps {
  message?: string;
}

export function FullScreenLoader({ message = 'Loading...' }: FullScreenLoaderProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={styles.fullScreenLoader}>
      <Animated.View style={[styles.loaderCircle, { transform: [{ scale: pulse }] }]}>
        <View style={styles.loaderInner} />
      </Animated.View>
    </View>
  );
}

/**
 * Pull to refresh indicator
 */
export function RefreshIndicator() {
  return (
    <View style={styles.refreshIndicator}>
      <View style={styles.refreshDot} />
      <View style={styles.refreshDot} />
      <View style={styles.refreshDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 12,
    flex: 1,
  },
  statsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  mapSkeleton: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  mapGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    opacity: 0.5,
  },
  mapBlock: {
    width: '20%',
    height: 60,
    backgroundColor: Colors.border,
    margin: 2,
    borderRadius: 4,
  },
  mapPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  fullScreenLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  refreshIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 6,
  },
  refreshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
