import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing, Layout } from '../../theme/Spacing';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { fetchWithFallback, API_BASE_URL } from '../../services/api';
import {
  FadeIn,
  BounceIn,
} from '../../components/animations';

type LeaderboardTab = 'weekly' | 'allTime' | 'local' | 'city';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  zonesCaptured: number;
  totalDistance: number;
  totalRuns: number;
  xp: number;
  isCurrentUser?: boolean;
}

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];

const TABS: { key: LeaderboardTab; label: string }[] = [
  { key: 'weekly', label: 'This Week' },
  { key: 'city', label: 'City' },
  { key: 'allTime', label: 'All Time' },
];

// Memoized rank helper functions
const getRankIcon = (rank: number): 'trophy' | 'medal' | null => {
  switch (rank) {
    case 1: return 'trophy';
    case 2: return 'medal';
    case 3: return 'medal';
    default: return null;
  }
};

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1: return '#FFD700';
    case 2: return '#C0C0C0';
    case 3: return '#CD7F32';
    default: return Colors.textMuted;
  }
};

// Memoized list item component for better performance
interface LeaderboardItemProps {
  item: LeaderboardEntry;
  index: number;
}

const LeaderboardItem = memo(({ item, index }: LeaderboardItemProps) => {
  const rankIcon = useMemo(() => getRankIcon(item.rank), [item.rank]);
  const rankColor = useMemo(() => getRankColor(item.rank), [item.rank]);
  const distanceKm = useMemo(() => (item.totalDistance / 1000).toFixed(1), [item.totalDistance]);
  
  return (
    <FadeIn delay={Math.min(600 + index * 50, 1500)}>
      <Card
        style={[
          styles.entryCard,
          item.isCurrentUser ? styles.currentUserCard : undefined
        ]}
        elevation="small"
      >
        <View style={styles.rankContainer}>
          {rankIcon ? (
            <Icon
              name={rankIcon}
              size={28}
              color={rankColor}
            />
          ) : (
            <Text style={[styles.rankText, { color: rankColor }]}>
              #{item.rank}
            </Text>
          )}
        </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, item.isCurrentUser && styles.currentUserAvatar]}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0)}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.nameText, item.isCurrentUser && styles.currentUserName]}>
            {item.name}
          </Text>
          <Text style={styles.statsText}>
            {item.zonesCaptured} zones | {distanceKm} km
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.zonesCaptured}</Text>
          <Text style={styles.scoreLabel}>zones</Text>
        </View>
      </Card>
    </FadeIn>
  );
});

LeaderboardItem.displayName = 'LeaderboardItem';

// Memoized tab component
interface TabButtonProps {
  tab: { key: LeaderboardTab; label: string };
  isActive: boolean;
  onPress: () => void;
}

const TabButton = memo(({ tab, isActive, onPress }: TabButtonProps) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[
      styles.tabText,
      isActive && styles.activeTabText
    ]}>
      {tab.label}
    </Text>
  </TouchableOpacity>
));

TabButton.displayName = 'TabButton';

// Memoized podium item
interface PodiumItemProps {
  entry: LeaderboardEntry;
  index: number;
}

const PodiumItem = memo(({ entry, index }: PodiumItemProps) => {
  const rankColor = useMemo(() => getRankColor(entry.rank), [entry.rank]);
  const barHeight = useMemo(() => {
    return index === 0 ? 80 : index === 1 ? 60 : 50;
  }, [index]);

  return (
    <BounceIn delay={index * 150}>
      <View style={[
        styles.podiumItem,
        index === 0 && styles.podiumFirst,
        index === 1 && styles.podiumSecond,
        index === 2 && styles.podiumThird,
      ]}>
        <View style={[styles.podiumAvatar, { borderColor: rankColor }]}>
          <Text style={styles.podiumAvatarText}>{entry.name.charAt(0)}</Text>
        </View>
        <Text style={styles.podiumName}>{entry.name.split(' ')[0]}</Text>
        <Text style={[styles.podiumScore, { color: rankColor }]}>
          {entry.zonesCaptured} zones
        </Text>
        <FadeIn delay={400 + index * 100}>
          <View style={[styles.podiumBar, {
            backgroundColor: rankColor,
            height: barHeight
          }]} />
        </FadeIn>
      </View>
    </BounceIn>
  );
});

PodiumItem.displayName = 'PodiumItem';

export default function LeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('weekly');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchWithFallback<{ 
      status: string; 
      data: { entries: LeaderboardEntry[] } 
    }>(
      `${API_BASE_URL}/leaderboard/${activeTab}`
    );
    
    if (data?.data?.entries) {
      setEntries(data.data.entries);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, [loadLeaderboard]);

  const currentUserEntry = useMemo(() => 
    entries.find(e => e.isCurrentUser),
    [entries]
  );

  // Memoized render function for FlashList
  const renderItem: ListRenderItem<LeaderboardEntry> = useCallback(({ item, index }) => (
    <LeaderboardItem item={item} index={index} />
  ), []);

  const keyExtractor = useCallback((item: LeaderboardEntry) => item.userId, []);

  // Memoized tab press handlers
  const handleTabPress = useCallback((tabKey: LeaderboardTab) => {
    setActiveTab(tabKey);
  }, []);

  // Memoized empty component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No entries yet</Text>
    </View>
  ), []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User Rank Card */}
      {currentUserEntry && (
        <Card style={styles.userRankCard} elevation="large">
          <View style={styles.userRankLeft}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <Text style={styles.userRankValue}>#{currentUserEntry.rank}</Text>
            <Text style={styles.userRankSubtext}>of {entries.length} runners</Text>
          </View>
          <View style={styles.userRankDivider} />
          <View style={styles.userRankRight}>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{currentUserEntry.zonesCaptured}</Text>
              <Text style={styles.userStatLabel}>Zones</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>
                {(currentUserEntry.totalDistance / 1000).toFixed(1)}
              </Text>
              <Text style={styles.userStatLabel}>km</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onPress={() => handleTabPress(tab.key)}
          />
        ))}
      </View>

      {/* City Selector */}
      {activeTab === 'city' && (
        <TouchableOpacity 
          style={styles.citySelector}
          onPress={() => setShowCitySelector(!showCitySelector)}
        >
          <Icon name="location" size={18} color={Colors.primary} />
          <Text style={styles.citySelectorText}>{selectedCity}</Text>
          <Icon name="chevron-down" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* City Dropdown */}
      {showCitySelector && activeTab === 'city' && (
        <View style={styles.cityDropdown}>
          {CITIES.map(city => (
            <TouchableOpacity
              key={city}
              style={[
                styles.cityOption,
                selectedCity === city && styles.cityOptionSelected
              ]}
              onPress={() => {
                setSelectedCity(city);
                setShowCitySelector(false);
              }}
            >
              <Text style={[
                styles.cityOptionText,
                selectedCity === city && styles.cityOptionTextSelected
              ]}>
                {city}
              </Text>
              {selectedCity === city && (
                <Icon name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Podium for Top 3 */}
      <View style={styles.podiumContainer}>
        {entries.slice(0, 3).map((entry, index) => (
          <PodiumItem key={entry.userId} entry={entry} index={index} />
        ))}
      </View>

      {/* Leaderboard List - Using FlashList for better performance */}
      <FlashList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.lg,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        drawDistance={200}
      />
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },

  // User Rank Card
  userRankCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankLeft: {
    flex: 1,
    alignItems: 'center',
  },
  userRankLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userRankValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  userRankSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  userRankDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  userRankRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  userStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.textInverse,
  },

  // City Selector
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    gap: Spacing.sm,
  },
  citySelectorText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  cityDropdown: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
  },
  cityOptionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  cityOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  cityOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    height: 200,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    width: 90,
  },
  podiumFirst: {
    transform: [{ scale: 1.1 }],
    zIndex: 3,
  },
  podiumSecond: {
    zIndex: 2,
  },
  podiumThird: {
    zIndex: 1,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: Spacing.sm,
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  podiumName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  podiumScore: {
    ...Typography.caption,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  podiumBar: {
    width: 60,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  // List Items
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  currentUserCard: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentUserAvatar: {
    backgroundColor: Colors.primary + '20',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  currentUserName: {
    color: Colors.primary,
  },
  statsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  scoreLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  // Empty state
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
