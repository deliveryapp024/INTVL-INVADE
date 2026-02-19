// app/route/[id].tsx - Route Detail Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Route {
  id: string;
  name: string;
  description: string;
  distance: number;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  elevationGain: number;
  elevationLoss: number;
  surface: 'road' | 'trail' | 'mixed' | 'track';
  rating: number;
  reviewCount: number;
  runCount: number;
  location: {
    city: string;
    state: string;
  };
  startPoint: {
    latitude: number;
    longitude: number;
  };
  waypoints: {
    latitude: number;
    longitude: number;
  }[];
  bestTimeToRun: string;
  tags: string[];
  safetyRating: 'high' | 'medium' | 'low';
  waterPoints: boolean;
  parkingAvailable: boolean;
  isSaved: boolean;
}

const MOCK_ROUTE: Route = {
  id: '1',
  name: 'Marine Drive Sunset Loop',
  description: 'A beautiful coastal run along Mumbai\'s iconic Marine Drive. This route offers stunning views of the Arabian Sea and the Mumbai skyline. Perfect for both beginners and experienced runners. The route is well-lit and safe for evening runs.',
  distance: 5.2,
  duration: 35,
  difficulty: 'easy',
  elevationGain: 15,
  elevationLoss: 15,
  surface: 'road',
  rating: 4.8,
  reviewCount: 245,
  runCount: 1245,
  location: {
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  startPoint: {
    latitude: 18.9442,
    longitude: 72.8235,
  },
  waypoints: [
    { latitude: 18.9442, longitude: 72.8235 },
    { latitude: 18.9450, longitude: 72.8240 },
    { latitude: 18.9460, longitude: 72.8250 },
    { latitude: 18.9470, longitude: 72.8260 },
  ],
  bestTimeToRun: 'Morning (6-8 AM) or Evening (5-7 PM)',
  tags: ['Scenic', 'Coastal', 'Flat', 'Traffic-Free'],
  safetyRating: 'high',
  waterPoints: true,
  parkingAvailable: true,
  isSaved: false,
};

const REVIEWS = [
  { id: '1', user: 'Rahul M.', rating: 5, text: 'Amazing route! Did it at 6 AM, perfect weather.', date: '2 days ago' },
  { id: '2', user: 'Priya S.', rating: 5, text: 'Beautiful sunset views. Highly recommend!', date: '1 week ago' },
  { id: '3', user: 'Amit K.', rating: 4, text: 'Great route but can get crowded on weekends.', date: '2 weeks ago' },
];

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [route] = useState<Route>(MOCK_ROUTE);
  const [isSaved, setIsSaved] = useState(route.isSaved);

  const handleSave = async () => {
    await FeedbackService.buttonPress('light');
    setIsSaved(!isSaved);
  };

  const handleStartRun = async () => {
    await FeedbackService.buttonPress('medium');
    router.push('/run');
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

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case 'high': return Colors.success;
      case 'medium': return Colors.warning;
      case 'low': return Colors.error;
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
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Icon name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="share" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: route.startPoint.latitude,
              longitude: route.startPoint.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={route.startPoint}>
              <View style={styles.startMarker}>
                <Text style={styles.startMarkerText}>START</Text>
              </View>
            </Marker>
            <Polyline
              coordinates={route.waypoints}
              strokeColor={Colors.primary}
              strokeWidth={4}
            />
          </MapView>
          
          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>Route Preview</Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.routeName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {route.name}
              </Text>
              <Text style={styles.locationText}>
                <Icon name="location" size={14} color={Colors.textSecondary} />
                {' '}{route.location.city}, {route.location.state}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star" size={14} color={Colors.warning} />
              <Text style={styles.ratingText}>{route.rating}</Text>
              <Text style={styles.reviewCount}>({route.reviewCount})</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Icon name="navigate" size={24} color={Colors.primary} />
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {route.distance} km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </Card>

            <Card style={styles.statCard}>
              <Icon name="time" size={24} color={Colors.secondary} />
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {route.duration} min
              </Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </Card>

            <Card style={styles.statCard}>
              <Icon name="trending-up" size={24} color={Colors.success} />
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                {route.elevationGain}m
              </Text>
              <Text style={styles.statLabel}>Elevation</Text>
            </Card>

            <Card style={styles.statCard}>
              <Icon name="stats-chart" size={24} color={getDifficultyColor(route.difficulty)} />
              <Text style={[styles.statValue, { color: getDifficultyColor(route.difficulty) }]}>
                {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
              </Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </Card>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {route.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Safety Info */}
          <Card style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Icon name="shield-checkmark" size={24} color={getSafetyColor(route.safetyRating)} />
              <Text style={[styles.safetyTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Safety Rating
              </Text>
              <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor(route.safetyRating) + '20' }]}>
                <Text style={[styles.safetyBadgeText, { color: getSafetyColor(route.safetyRating) }]}>
                  {route.safetyRating.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.safetyFeatures}>
              {route.waterPoints && (
                <View style={styles.safetyFeature}>
                  <Icon name="water" size={18} color={Colors.primary} />
                  <Text style={styles.safetyFeatureText}>Water Points</Text>
                </View>
              )}
              {route.parkingAvailable && (
                <View style={styles.safetyFeature}>
                  <Icon name="car" size={18} color={Colors.primary} />
                  <Text style={styles.safetyFeatureText}>Parking Available</Text>
                </View>
              )}
              <View style={styles.safetyFeature}>
                <Icon name="sunny" size={18} color={Colors.warning} />
                <Text style={styles.safetyFeatureText}>Best: {route.bestTimeToRun}</Text>
              </View>
            </View>
          </Card>

          {/* Description */}
          <Card style={styles.descriptionCard}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              About This Route
            </Text>
            <Text style={[styles.description, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              {route.description}
            </Text>
            
            <View style={styles.runCountRow}>
              <Icon name="people" size={18} color={Colors.primary} />
              <Text style={styles.runCountText}>
                {route.runCount} people ran this route this month
              </Text>
            </View>
          </Card>

          {/* Reviews */}
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E', marginTop: Spacing.lg }]}>
            Reviews ({route.reviewCount})
          </Text>

          {REVIEWS.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.user[0]}</Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={[styles.reviewUser, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                    {review.user}
                  </Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name={i < review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={Colors.warning}
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
                {review.text}
              </Text>
            </Card>
          ))}

          <TouchableOpacity style={styles.viewAllReviews}>
            <Text style={styles.viewAllReviewsText}>View All Reviews</Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity style={styles.navigateButton}>
          <Icon name="navigate" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton} onPress={handleStartRun}>
          <Icon name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start This Route</Text>
        </TouchableOpacity>
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
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  startMarker: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  startMarkerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  routeName: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    marginRight: Spacing.md,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    width: '23%',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  safetyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  safetyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  safetyBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  safetyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  safetyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  safetyFeatureText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  descriptionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  runCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  runCountText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  reviewCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewMeta: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  viewAllReviews: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  viewAllReviewsText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
  navigateButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
