// app/club/[id].tsx - Club Detail Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';
import { useAuth } from '../../src/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'feed' | 'events' | 'members' | 'about';

interface Club {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  logoUrl?: string;
  city: string;
  state: string;
  type: string;
  memberCount: number;
  activeMemberCount: number;
  totalDistance: number;
  totalRuns: number;
  totalEvents: number;
  isPrivate: boolean;
  isWomenOnly: boolean;
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappLink?: string;
  rules: string[];
  createdAt: string;
}

const MOCK_CLUB: Club = {
  id: '1',
  name: 'Mumbai Runners',
  description: 'Mumbai\'s largest running community. We organize weekly group runs, training sessions, and social events. Join us to improve your running, meet fellow runners, and explore Mumbai!',
  city: 'Mumbai',
  state: 'Maharashtra',
  type: 'running',
  memberCount: 2450,
  activeMemberCount: 312,
  totalDistance: 125000,
  totalRuns: 5234,
  totalEvents: 156,
  isPrivate: false,
  isWomenOnly: false,
  rules: [
    'Be respectful to all members',
    'No spam or self-promotion',
    'Follow traffic rules during runs',
    'Help fellow runners',
  ],
  createdAt: '2022-01-15',
};

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [club] = useState<Club>(MOCK_CLUB);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClubData();
  }, [id]);

  const loadClubData = async () => {
    setIsJoined(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClubData();
    setRefreshing(false);
  };

  const handleJoinClub = async () => {
    await FeedbackService.buttonPress('medium');
    setIsLoading(true);
    setTimeout(() => {
      setIsJoined(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLeaveClub = async () => {
    await FeedbackService.buttonPress('light');
    setIsJoined(false);
  };

  const renderFeedTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.announcementCard}>
        <View style={styles.announcementHeader}>
          <Icon name="megaphone" size={20} color={Colors.primary} />
          <Text style={[styles.announcementTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Announcement
          </Text>
        </View>
        <Text style={[styles.announcementText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          🎉 Congratulations to all members who completed the Mumbai Marathon!
        </Text>
      </Card>
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
        Upcoming Events
      </Text>
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
        Members ({club.memberCount})
      </Text>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.aboutCard}>
        <Text style={[styles.aboutTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          About
        </Text>
        <Text style={[styles.aboutText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          {club.description}
        </Text>
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.clubHeader}>
          <View style={styles.clubIcon}>
            <Icon name="people" size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.clubName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            {club.name}
          </Text>
          <Text style={styles.clubLocation}>
            {club.city}, {club.state}
          </Text>
          
          {isJoined ? (
            <TouchableOpacity style={styles.joinedButton} onPress={handleLeaveClub}>
              <Text style={styles.joinedButtonText}>Joined</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinClub} disabled={isLoading}>
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Joining...' : 'Join Club'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {(['feed', 'events', 'members', 'about'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab === 'feed' && renderFeedTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'members' && renderMembersTab()}
        {activeTab === 'about' && renderAboutTab()}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  clubIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clubName: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  clubLocation: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: 160,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  joinedButton: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 24,
  },
  joinedButtonText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabScroll: {
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
  activeTab: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: { color: '#FFFFFF' },
  tabContent: { paddingHorizontal: Spacing.lg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  announcementCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + '10',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  announcementText: {
    fontSize: 14,
    lineHeight: 22,
  },
  aboutCard: { marginBottom: Spacing.md },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
