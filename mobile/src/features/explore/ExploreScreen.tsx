// src/features/explore/ExploreScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing } from '../../theme/Spacing';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { FadeIn } from '../../components/FadeIn';
import { useTheme } from '../../theme/ThemeContext';
import { FeedbackService } from '../../services/FeedbackService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'routes' | 'trails' | 'events';

interface Route {
  id: string;
  name: string;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  elevation: number;
  rating: number;
  reviews: number;
  image?: string;
  isPopular?: boolean;
  location: string;
}

interface Trail {
  id: string;
  name: string;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  elevation: number;
  type: 'hiking' | 'mountain' | 'trail';
  rating: number;
  safety: 'safe' | 'moderate' | 'challenging';
  location: string;
  bestSeason: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  distance: number;
  type: 'group_run' | 'marathon' | 'trail' | 'social';
  participants: number;
  maxParticipants?: number;
  location: string;
  isJoined?: boolean;
}

const MOCK_ROUTES: Route[] = [
  { id: '1', name: 'Marine Drive Loop', distance: 5.2, difficulty: 'easy', elevation: 15, rating: 4.8, reviews: 234, isPopular: true, location: 'South Mumbai' },
  { id: '2', name: 'Joggers Park Trail', distance: 3.1, difficulty: 'easy', elevation: 5, rating: 4.6, reviews: 189, location: 'Bandra West' },
  { id: '3', name: 'Aarey Forest Run', distance: 8.5, difficulty: 'moderate', elevation: 45, rating: 4.9, reviews: 312, isPopular: true, location: 'Goregaon' },
  { id: '4', name: 'Sanjay Gandhi Park', distance: 12.0, difficulty: 'hard', elevation: 120, rating: 4.7, reviews: 156, location: 'Borivali' },
  { id: '5', name: 'Powai Lake Circuit', distance: 4.8, difficulty: 'easy', elevation: 20, rating: 4.5, reviews: 98, location: 'Powai' },
];

const MOCK_TRAILS: Trail[] = [
  { id: '1', name: 'Kalsubai Peak Trek', distance: 12.5, difficulty: 'hard', elevation: 1646, type: 'mountain', rating: 4.9, safety: 'challenging', location: 'Igatpuri', bestSeason: 'Oct-Mar' },
  { id: '2', name: 'Rajmachi Fort Trail', distance: 15.0, difficulty: 'moderate', elevation: 450, type: 'hiking', rating: 4.7, safety: 'safe', location: 'Lonavala', bestSeason: 'Jun-Feb' },
  { id: '3', name: 'Matheran Hill Walk', distance: 8.2, difficulty: 'easy', elevation: 120, type: 'trail', rating: 4.6, safety: 'safe', location: 'Matheran', bestSeason: 'Year-round' },
  { id: '4', name: 'Harishchandragad Trek', distance: 18.5, difficulty: 'hard', elevation: 1424, type: 'mountain', rating: 4.8, safety: 'challenging', location: 'Ahmednagar', bestSeason: 'Oct-Mar' },
  { id: '5', name: 'Karnala Bird Sanctuary', distance: 6.0, difficulty: 'easy', elevation: 150, type: 'trail', rating: 4.5, safety: 'safe', location: 'Panvel', bestSeason: 'Nov-Feb' },
];

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'Sunday Morning Run Club', date: 'Sun, Feb 23', time: '6:00 AM', distance: 5, type: 'group_run', participants: 24, maxParticipants: 30, location: 'Marine Drive' },
  { id: '2', title: 'Mumbai Half Marathon', date: 'Sun, Mar 9', time: '5:30 AM', distance: 21.1, type: 'marathon', participants: 150, maxParticipants: 500, location: 'BKC' },
  { id: '3', title: 'Trail Running Workshop', date: 'Sat, Mar 1', time: '7:00 AM', distance: 8, type: 'trail', participants: 12, maxParticipants: 20, location: 'Sanjay Gandhi Park' },
  { id: '4', title: 'Sunset Social Run', date: 'Sat, Feb 22', time: '6:00 PM', distance: 3, type: 'social', participants: 18, location: 'Juhu Beach' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('routes');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleTabChange = async (tab: TabType) => {
    await FeedbackService.selection();
    setActiveTab(tab);
  };

  const handleRoutePress = async (route: Route) => {
    await FeedbackService.buttonPress('light');
    // Navigate to route detail
  };

  const handleTrailPress = async (trail: Trail) => {
    await FeedbackService.buttonPress('light');
    // Navigate to trail detail
  };

  const handleEventPress = async (event: Event) => {
    await FeedbackService.buttonPress('light');
    // Navigate to event detail
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'moderate': return Colors.warning;
      case 'hard': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const renderRoutesTab = () => (
    <FlatList
      data={MOCK_ROUTES}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleRoutePress(item)}>
          <Card style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <View style={styles.routeTitleContainer}>
                <Text style={[styles.routeName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {item.name}
                </Text>
                <Text style={styles.routeLocation}>{item.location}</Text>
              </View>
              {item.isPopular && (
                <View style={styles.popularBadge}>
                  <Icon name="flame" size={12} color={Colors.warning} />
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}
            </View>

            <View style={styles.routeStats}>
              <View style={styles.stat}>
                <Icon name="navigate" size={16} color={Colors.primary} />
                <Text style={styles.statText}>{item.distance} km</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="stats-chart" size={16} color={getDifficultyColor(item.difficulty)} />
                <Text style={[styles.statText, { color: getDifficultyColor(item.difficulty) }]}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Icon name="trending-up" size={16} color={Colors.secondary} />
                <Text style={styles.statText}>{item.elevation}m</Text>
              </View>
            </View>

            <View style={styles.routeFooter}>
              <View style={styles.rating}>
                <Icon name="star" size={14} color={Colors.warning} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
              </View>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderTrailsTab = () => (
    <FlatList
      data={MOCK_TRAILS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleTrailPress(item)}>
          <Card style={styles.trailCard}>
            <View style={styles.trailTypeBadge}>
              <Icon 
                name={item.type === 'mountain' ? 'trophy' : item.type === 'hiking' ? 'navigate' : 'map'} 
                size={14} 
                color={Colors.primary} 
              />
              <Text style={styles.trailTypeText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
            </View>

            <Text style={[styles.trailName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              {item.name}
            </Text>
            <Text style={styles.trailLocation}>{item.location}</Text>

            <View style={styles.trailStats}>
              <View style={styles.trailStat}>
                <Icon name="navigate" size={16} color={Colors.primary} />
                <Text style={styles.trailStatText}>{item.distance} km</Text>
              </View>
              <View style={styles.trailStat}>
                <Icon name="trending-up" size={16} color={Colors.secondary} />
                <Text style={styles.trailStatText}>{item.elevation}m</Text>
              </View>
              <View style={styles.trailStat}>
                <Icon name="shield" size={16} color={getDifficultyColor(item.safety)} />
                <Text style={[styles.trailStatText, { color: getDifficultyColor(item.safety) }]}>
                  {item.safety}
                </Text>
              </View>
            </View>

            <View style={styles.trailFooter}>
              <View style={styles.bestSeason}>
                <Icon name="sunny" size={14} color={Colors.warning} />
                <Text style={styles.seasonText}>Best: {item.bestSeason}</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                  {item.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  const renderEventsTab = () => (
    <FlatList
      data={MOCK_EVENTS}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleEventPress(item)}>
          <Card style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={styles.eventTypeBadge}>
                <Icon 
                  name={item.type === 'marathon' ? 'trophy' : item.type === 'trail' ? 'map' : 'people'} 
                  size={14} 
                  color={Colors.primary} 
                />
                <Text style={styles.eventTypeText}>
                  {item.type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              {item.isJoined && (
                <View style={styles.joinedBadge}>
                  <Icon name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={styles.joinedText}>Joined</Text>
                </View>
              )}
            </View>

            <Text style={[styles.eventTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              {item.title}
            </Text>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <Icon name="time" size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>{item.date} • {item.time}</Text>
              </View>
              <View style={styles.eventDetail}>
                <Icon name="location" size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>{item.location}</Text>
              </View>
              <View style={styles.eventDetail}>
                <Icon name="navigate" size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>{item.distance} km</Text>
              </View>
            </View>

            <View style={styles.eventFooter}>
              <View style={styles.participants}>
                <Icon name="people" size={16} color={Colors.primary} />
                <Text style={styles.participantsText}>
                  {item.participants}{item.maxParticipants ? `/${item.maxParticipants}` : ''} participants
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.joinButton, item.isJoined && styles.joinedButton]}
              >
                <Text style={[styles.joinButtonText, item.isJoined && styles.joinedButtonText]}>
                  {item.isJoined ? 'Joined' : 'Join'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Explore
        </Text>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['routes', 'trails', 'events'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'routes' && renderRoutesTab()}
        {activeTab === 'trails' && renderTrailsTab()}
        {activeTab === 'events' && renderEventsTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
    fontWeight: '800',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.md,
  },
  // Routes
  routeCard: {
    marginBottom: Spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  routeTitleContainer: {
    flex: 1,
  },
  routeName: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  popularText: {
    ...Typography.captionSmall,
    color: Colors.warning,
    fontWeight: '700',
  },
  routeStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  reviewsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  startButtonText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Trails
  trailCard: {
    marginBottom: Spacing.md,
  },
  trailTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  trailTypeText: {
    ...Typography.captionSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  trailName: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: 4,
  },
  trailLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  trailStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trailStatText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  trailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  bestSeason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seasonText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  difficultyText: {
    ...Typography.captionSmall,
    fontWeight: '800',
  },
  // Events
  eventCard: {
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  eventTypeText: {
    ...Typography.captionSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  joinedText: {
    ...Typography.captionSmall,
    color: Colors.success,
    fontWeight: '700',
  },
  eventTitle: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  eventDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  joinedButton: {
    backgroundColor: Colors.success + '20',
  },
  joinButtonText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  joinedButtonText: {
    color: Colors.success,
  },
});
