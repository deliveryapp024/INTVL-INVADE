// app/event/[id].tsx - Event Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'race' | 'group_run' | 'trail_run' | 'training' | 'social';
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  distance?: number;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  maxParticipants?: number;
  currentParticipants: number;
  price?: number;
  host: {
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  requirements?: string;
  whatsappLink?: string;
  isJoined: boolean;
}

const MOCK_EVENT: Event = {
  id: '1',
  title: 'Sunday Morning Run Club',
  description: 'Join us for our weekly Sunday morning run along Marine Drive! All paces welcome. We\'ll start with a warm-up, run 5km together, and finish with coffee at a nearby cafe.\n\nThis is a great opportunity to meet fellow runners and start your Sunday on a healthy note.',
  type: 'group_run',
  date: 'Sunday, February 23, 2026',
  time: '6:00 AM',
  location: {
    name: 'Marine Drive',
    address: 'Near Nariman Point, Mumbai',
    latitude: 18.9442,
    longitude: 72.8235,
  },
  distance: 5,
  difficulty: 'easy',
  maxParticipants: 50,
  currentParticipants: 24,
  price: 0,
  host: {
    name: 'Mumbai Runners',
    isVerified: true,
  },
  requirements: 'Bring water bottle and comfortable running shoes',
  whatsappLink: 'https://chat.whatsapp.com/example',
  isJoined: false,
};

const PARTICIPANT_AVATARS = [
  { id: '1', name: 'Rahul' },
  { id: '2', name: 'Priya' },
  { id: '3', name: 'Vikram' },
  { id: '4', name: 'Neha' },
  { id: '5', name: 'Amit' },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [event] = useState<Event>(MOCK_EVENT);
  const [isJoined, setIsJoined] = useState(event.isJoined);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    await FeedbackService.buttonPress('medium');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsJoined(true);
      setIsLoading(false);
    }, 800);
  };

  const handleCancel = async () => {
    await FeedbackService.buttonPress('light');
    setIsJoined(false);
  };

  const handleAddToCalendar = async () => {
    await FeedbackService.buttonPress('light');
    // In production, use expo-calendar
    alert('Added to calendar!');
  };

  const handleShare = async () => {
    await FeedbackService.buttonPress('light');
    // In production, use expo-sharing
    alert('Share event coming soon!');
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'race': return 'trophy';
      case 'group_run': return 'people';
      case 'trail_run': return 'map';
      case 'training': return 'fitness';
      case 'social': return 'cafe';
      default: return 'flag';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'race': return Colors.warning;
      case 'group_run': return Colors.primary;
      case 'trail_run': return Colors.success;
      case 'training': return Colors.secondary;
      case 'social': return '#E91E63';
      default: return Colors.primary;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'moderate': return Colors.warning;
      case 'hard': return Colors.error;
      case 'expert': return '#9C27B0';
      default: return Colors.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Icon name="share" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(event.type) + '20' }]}>
            <Icon name={getEventTypeIcon(event.type)} size={16} color={getEventTypeColor(event.type)} />
            <Text style={[styles.eventTypeText, { color: getEventTypeColor(event.type) }]}>
              {event.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Icon name="people" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.hostName}>{event.host.name}</Text>
            {event.host.isVerified && (
              <Icon name="checkmark-circle" size={16} color={Colors.primary} />
            )}
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.infoCards}>
          <Card style={styles.infoCard}>
            <Icon name="calendar" size={24} color={Colors.primary} />
            <Text style={[styles.infoLabel, { color: isDark ? '#888888' : '#666666' }]}>Date</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>{event.date}</Text>
          </Card>

          <Card style={styles.infoCard}>
            <Icon name="time" size={24} color={Colors.secondary} />
            <Text style={[styles.infoLabel, { color: isDark ? '#888888' : '#666666' }]}>Time</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>{event.time}</Text>
          </Card>

          {event.distance && (
            <Card style={styles.infoCard}>
              <Icon name="navigate" size={24} color={Colors.success} />
              <Text style={[styles.infoLabel, { color: isDark ? '#888888' : '#666666' }]}>Distance</Text>
              <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>{event.distance} km</Text>
            </Card>
          )}

          {event.difficulty && (
            <Card style={styles.infoCard}>
              <Icon name="stats-chart" size={24} color={getDifficultyColor(event.difficulty)} />
              <Text style={[styles.infoLabel, { color: isDark ? '#888888' : '#666666' }]}>Difficulty</Text>
              <Text style={[styles.infoValue, { color: getDifficultyColor(event.difficulty) }]}>
                {event.difficulty.charAt(0).toUpperCase() + event.difficulty.slice(1)}
              </Text>
            </Card>
          )}
        </View>

        {/* Participants */}
        <Card style={styles.participantsCard}>
          <View style={styles.participantsHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              Participants
            </Text>
            <Text style={styles.participantsCount}>
              {event.currentParticipants}
              {event.maxParticipants && `/${event.maxParticipants}`} going
            </Text>
          </View>
          
          <View style={styles.avatarsRow}>
            {PARTICIPANT_AVATARS.map((p, index) => (
              <View key={p.id} style={[styles.participantAvatar, { marginLeft: index > 0 ? -12 : 0 }]}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{p.name[0]}</Text>
                </View>
              </View>
            ))}
            {event.currentParticipants > 5 && (
              <View style={[styles.participantAvatar, { marginLeft: -12 }]}>
                <View style={[styles.avatarCircle, styles.moreAvatar]}>
                  <Text style={styles.moreAvatarText}>+{event.currentParticipants - 5}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Location */}
        <Card style={styles.locationCard}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Location
          </Text>
          <Text style={[styles.locationName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            {event.location.name}
          </Text>
          <Text style={[styles.locationAddress, { color: isDark ? '#888888' : '#666666' }]}>
            {event.location.address}
          </Text>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: event.location.latitude,
                  longitude: event.location.longitude,
                }}
              >
                <View style={styles.marker}>
                  <Icon name="location" size={20} color={Colors.primary} />
                </View>
              </Marker>
            </MapView>
          </View>

          <TouchableOpacity style={styles.directionsButton}>
            <Icon name="navigate-circle" size={20} color={Colors.primary} />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.aboutCard}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            About Event
          </Text>
          <Text style={[styles.description, { color: isDark ? '#CCCCCC' : '#666666' }]}>
            {event.description}
          </Text>
          
          {event.requirements && (
            <>
              <Text style={[styles.subSectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                What to Bring
              </Text>
              <Text style={[styles.requirements, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                {event.requirements}
              </Text>
            </>
          )}
        </Card>

        {/* Spacer for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.priceContainer}>
          {event.price === 0 ? (
            <Text style={styles.freeText}>Free</Text>
          ) : (
            <Text style={styles.priceText}>₹{event.price}</Text>
          )}
        </View>
        
        {isJoined ? (
          <View style={styles.joinedActions}>
            <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
              <Icon name="calendar" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel RSVP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={isLoading}
          >
            <Text style={styles.joinButtonText}>
              {isLoading ? 'Joining...' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: 100,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: Spacing.md,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  infoCard: {
    width: '48%',
    padding: Spacing.md,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  participantsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  participantsCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    borderWidth: 2,
    borderColor: Colors.surface,
    borderRadius: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  moreAvatar: {
    backgroundColor: Colors.textMuted,
  },
  moreAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  locationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  mapContainer: {
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  aboutCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  requirements: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  freeText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.success,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  joinedActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
