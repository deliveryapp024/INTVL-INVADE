/**
 * SkeletonLoader - Loading skeleton screens with shimmer
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ShimmerLoading } from './AnimationComponents';
import { Colors } from '../../theme/Colors';

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerLoading width={40} height={40} borderRadius={20} />
        <ShimmerLoading width={120} height={20} borderRadius={4} />
        <ShimmerLoading width={40} height={40} borderRadius={20} />
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <ShimmerLoading width={100} height={100} borderRadius={50} />
        </View>
        <View style={styles.textRow}>
          <ShimmerLoading width={180} height={24} borderRadius={4} />
          <ShimmerLoading width={120} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
        <ShimmerLoading width="100%" height={8} borderRadius={4} style={{ marginTop: 20 }} />
        <View style={styles.streakRow}>
          <ShimmerLoading width={150} height={32} borderRadius={16} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statCard}>
            <ShimmerLoading width={32} height={32} borderRadius={16} />
            <ShimmerLoading width={50} height={24} borderRadius={4} style={{ marginTop: 8 }} />
            <ShimmerLoading width={40} height={14} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Tabs */}
      <ShimmerLoading width="100%" height={48} borderRadius={8} style={{ marginTop: 20 }} />

      {/* Content */}
      <View style={styles.content}>
        <ShimmerLoading width="100%" height={120} borderRadius={12} />
      </View>
    </View>
  );
}

export function LeaderboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerLoading width={44} height={44} borderRadius={22} />
        <ShimmerLoading width={150} height={24} borderRadius={4} />
        <ShimmerLoading width={44} height={44} borderRadius={22} />
      </View>

      {/* User Rank Card */}
      <View style={styles.card}>
        <ShimmerLoading width="100%" height={100} borderRadius={12} />
      </View>

      {/* Tabs */}
      <ShimmerLoading width="100%" height={40} borderRadius={20} style={{ marginTop: 16 }} />

      {/* List Items */}
      <View style={styles.list}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ShimmerLoading
            key={i}
            width="100%"
            height={70}
            borderRadius={12}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
}

export function FriendsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerLoading width={44} height={44} borderRadius={22} />
        <ShimmerLoading width={100} height={24} borderRadius={4} />
        <ShimmerLoading width={80} height={32} borderRadius={16} />
      </View>

      {/* Tabs */}
      <ShimmerLoading width="100%" height={40} borderRadius={20} style={{ marginTop: 16 }} />

      {/* Search */}
      <ShimmerLoading width="100%" height={44} borderRadius={22} style={{ marginTop: 16 }} />

      {/* Friends List */}
      <View style={styles.list}>
        {[1, 2, 3, 4, 5].map((i) => (
          <ShimmerLoading
            key={i}
            width="100%"
            height={80}
            borderRadius={12}
            style={{ marginBottom: 8 }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  textRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  streakRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '23%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  content: {
    marginTop: 16,
  },
  list: {
    marginTop: 16,
  },
});
