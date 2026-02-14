import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing } from '../../theme/Spacing';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import {
  PulseDot,
  PressableScale,
  FadeIn,
} from '../../components/animations';

// Mock friends data
const MOCK_FRIENDS = [
  { id: '1', name: 'Rahul M.', username: '@rahulruns', zones: 45, isRunning: true },
  { id: '2', name: 'Priya K.', username: '@priyafit', zones: 38, isRunning: false },
  { id: '3', name: 'Arjun S.', username: '@arjunzone', zones: 32, isRunning: true },
  { id: '4', name: 'Neha P.', username: '@nehaactive', zones: 28, isRunning: false },
];

const MOCK_SQUADS = [
  { 
    id: '1', 
    name: 'Koramangala Runners', 
    members: 12, 
    totalZones: 234,
    rank: 3,
  },
  { 
    id: '2', 
    name: 'Indiranagar Squad', 
    members: 8, 
    totalZones: 189,
    rank: 5,
  },
];

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'friends' | 'squads'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Squad</Text>
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={() => router.push('/referral')}
        >
          <Text style={styles.inviteButtonText}>+ Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({MOCK_FRIENDS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'squads' && styles.activeTab]}
          onPress={() => setActiveTab('squads')}
        >
          <Text style={[styles.tabText, activeTab === 'squads' && styles.activeTabText]}>
            Squads ({MOCK_SQUADS.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends or squads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        {activeTab === 'friends' ? (
          <View style={styles.list}>
            {/* Friends Online Section */}
            <Text style={styles.sectionTitle}>Running Now</Text>
            {MOCK_FRIENDS.filter(f => f.isRunning).map(friend => (
              <Card key={friend.id} style={styles.friendCard} elevation="small">
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{friend.name.charAt(0)}</Text>
                  <View style={styles.onlineIndicatorContainer}>
                    <PulseDot color={Colors.success} size={10} active={true} />
                  </View>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                </View>
                <View style={styles.friendStats}>
                  <Text style={styles.friendZones}>{friend.zones} zones</Text>
                  <Text style={styles.runningNow}>Running now</Text>
                </View>
              </Card>
            ))}

            {/* All Friends */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>All Friends</Text>
            {MOCK_FRIENDS.filter(f => !f.isRunning).map(friend => (
              <Card key={friend.id} style={styles.friendCard} elevation="small">
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>{friend.name.charAt(0)}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>{friend.username}</Text>
                </View>
                <View style={styles.friendStats}>
                  <Text style={styles.friendZones}>{friend.zones} zones</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {/* Create Squad Button */}
            <Button
              title="+ Create New Squad"
              variant="secondary"
              size="large"
              onPress={() => {}}
            />

            {/* Squads List */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Your Squads</Text>
            {MOCK_SQUADS.map(squad => (
              <Card key={squad.id} style={styles.squadCard} elevation="medium">
                <View style={styles.squadHeader}>
                  <View style={styles.squadAvatar}>
                    <Icon name="people" size={28} color={Colors.primary} />
                  </View>
                  <View style={styles.squadInfo}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    <Text style={styles.squadMembers}>{squad.members} members</Text>
                  </View>
                  <View style={styles.squadRank}>
                    <Text style={styles.squadRankLabel}>Rank</Text>
                    <Text style={styles.squadRankValue}>#{squad.rank}</Text>
                  </View>
                </View>
                
                <View style={styles.squadStats}>
                  <View style={styles.squadStat}>
                    <Text style={styles.squadStatValue}>{squad.totalZones}</Text>
                    <Text style={styles.squadStatLabel}>Total Zones</Text>
                  </View>
                  <View style={styles.squadStat}>
                    <Text style={styles.squadStatValue}>{squad.members}</Text>
                    <Text style={styles.squadStatLabel}>Runners</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.squadButton}>
                  <Text style={styles.squadButtonText}>View Squad</Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  inviteButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  inviteButtonText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textInverse,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  
  // List
  list: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  
  // Friend Card
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  onlineIndicatorContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  friendName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  friendUsername: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendZones: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  runningNow: {
    ...Typography.captionSmall,
    color: Colors.success,
    marginTop: 2,
  },
  
  // Squad Card
  squadCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  squadAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.territory.mineTransparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatarText: {
    fontSize: 28,
  },
  squadInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  squadName: {
    ...Typography.h4,
    color: Colors.text,
  },
  squadMembers: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  squadRank: {
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  squadRankLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
  },
  squadRankValue: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  squadStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  squadStat: {
    flex: 1,
  },
  squadStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  squadStatLabel: {
    ...Typography.captionSmall,
    color: Colors.textSecondary,
  },
  squadButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    alignItems: 'center',
  },
  squadButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
