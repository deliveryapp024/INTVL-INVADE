import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polygon, Polyline, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../theme/Colors';
import { Typography } from '../../theme/Typography';
import { Spacing, Layout } from '../../theme/Spacing';
import { API_BASE_URL } from '../../services/api';
import { ZoneBadge } from '../../components/ZoneBadge';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { FadeIn, StaggerContainer } from '../../components';
import { WeatherWidget } from '../../components/WeatherWidget';
import { StreakWidget } from '../../components/StreakWidget';
import { usePerformanceTracking } from '../../utils/PerformanceMonitor';
import { HapticsPreset } from '../../utils/haptics';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const USER_ID = 'test-user-id';

type ZoneStatus = 'mine' | 'opponent' | 'neutral' | 'contested';

interface Zone {
  h3_index: string;
  owner_user_id: string;
  distance_km: number;
  is_loop_bonus?: boolean;
  boundary?: { latitude: number; longitude: number }[];
  status: ZoneStatus;
}

interface WeeklyStats {
  zonesCaptured: number;
  totalDistance: number;
  rank: number;
  totalCompetitors: number;
}

function HomeScreenContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  
  // Track performance
  usePerformanceTracking('HomeScreen', __DEV__);
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    zonesCaptured: 0,
    totalDistance: 0,
    rank: 0,
    totalCompetitors: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showMyRuns, setShowMyRuns] = useState(true);
  const [runCoords, setRunCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Fetch zones and stats
  const loadData = useCallback(async () => {
    try {
      const [zonesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/zones/current?userId=${encodeURIComponent(USER_ID)}`),
      ]);

      const zonesData = await zonesRes.json();

      if (zonesData.status === 'success') {
        const processedZones = zonesData.data.zones.map((z: any): Zone => ({
          ...z,
          status: z.owner_user_id === USER_ID ? 'mine' : 
                  z.owner_user_id ? 'opponent' : 'neutral',
        }));
        setZones(processedZones);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Center map on user location
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [userLocation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Zone color based on status
  const getZoneColor = (status: ZoneStatus, isLoopBonus?: boolean) => {
    if (isLoopBonus) return Colors.territory.contestedTransparent;
    switch (status) {
      case 'mine': return Colors.territory.mineTransparent;
      case 'opponent': return Colors.territory.opponentTransparent;
      case 'contested': return Colors.territory.contestedTransparent;
      default: return Colors.territory.neutralTransparent;
    }
  };

  const nearbyZones = useMemo(() => {
    return zones
      .filter(z => (z.distance_km || 0) < 2)
      .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0))
      .slice(0, 5);
  }, [zones]);

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Territory Zones */}
        {zones.map((zone) => (
          zone.boundary && zone.boundary.length > 0 && (
            <Polygon
              key={zone.h3_index}
              coordinates={zone.boundary}
              fillColor={getZoneColor(zone.status, zone.is_loop_bonus)}
              strokeColor={zone.status === 'mine' ? Colors.territory.mine : 'transparent'}
              strokeWidth={zone.status === 'mine' ? 2 : 0}
            />
          )
        ))}
        
        {/* Previous runs */}
        {showMyRuns && runCoords.length > 0 && (
          <Polyline
            coordinates={runCoords}
            strokeColor={Colors.map.route}
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>INVT</Text>
          <View style={styles.logoDot} />
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              HapticsPreset.buttonPress();
              router.push('/profile');
            }}
          >
            <Icon name="person-circle" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              HapticsPreset.buttonPress();
              router.push('/leaderboard');
            }}
          >
            <Icon name="trophy" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekly Stats Card */}
      <View style={styles.statsCardContainer}>
        <Card elevation="large" padding="medium">
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.zonesCaptured}</Text>
              <Text style={styles.statLabel}>Zones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(weeklyStats.totalDistance / 1000).toFixed(1)}</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{weeklyStats.rank || '-'}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {/* Widgets Row */}
        <View style={styles.widgetsRow}>
          <WeatherWidget />
          <StreakWidget currentStreak={7} bestStreak={14} />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zonesScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Zone Status Summary */}
          <Card style={styles.zoneSummaryCard} elevation="small">
            <View style={styles.zoneSummaryHeader}>
              <Icon name="crown" size={16} color={Colors.territory.mine} />
              <Text style={styles.zoneSummaryTitle}>Your Territory</Text>
            </View>
            <View style={styles.zoneBadges}>
              <ZoneBadge status="mine" count={zones.filter(z => z.status === 'mine').length} size="small" />
              <ZoneBadge status="contested" count={zones.filter(z => z.status === 'contested').length} size="small" />
            </View>
          </Card>

          {/* Nearby Zones */}
          {nearbyZones.map((zone) => (
            <TouchableOpacity 
              key={zone.h3_index}
              style={styles.zoneCard}
              onPress={() => {
                // Center map on zone
                if (zone.boundary && zone.boundary.length > 0 && mapRef.current) {
                  mapRef.current.fitToCoordinates(zone.boundary, {
                    edgePadding: { top: 100, right: 100, bottom: 300, left: 100 },
                    animated: true,
                  });
                }
              }}
            >
              <Card style={[styles.zoneCardInner, { borderLeftWidth: 3, borderLeftColor: 
                zone.status === 'mine' ? Colors.territory.mine :
                zone.status === 'opponent' ? Colors.territory.opponent :
                Colors.territory.neutral
              }]}>
                <ZoneBadge status={zone.status} size="small" />
                <Text style={styles.zoneDistance}>{(zone.distance_km || 0).toFixed(1)} km away</Text>
                {zone.is_loop_bonus && (
                  <View style={styles.loopBonusRow}>
                    <Icon name="flame" size={12} color={Colors.territory.contested} />
                    <Text style={styles.loopBonus}>Loop Bonus</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Start Run Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            HapticsPreset.runStart();
            router.push('/run');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.startButtonRow}>
            <Icon name="run-fast" size={24} color={Colors.textInverse} />
            <Text style={styles.startButtonText}>START RUN</Text>
          </View>
          <Text style={styles.startButtonSubtext}>Capture zones in your area</Text>
        </TouchableOpacity>

        {/* Toggle runs visibility */}
        <TouchableOpacity 
          style={styles.toggleRuns}
          onPress={() => setShowMyRuns(!showMyRuns)}
        >
          <View style={styles.toggleRunsRow}>
            <Icon name={showMyRuns ? "eye" : "eye-off"} size={16} color={Colors.textSecondary} />
            <Text style={styles.toggleRunsText}>
              {showMyRuns ? 'Hide my runs' : 'Show my runs'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Wrap with ErrorBoundary
export default function HomeScreen() {
  return (
    <ErrorBoundary screenName="Home">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 2,
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerButtonText: {
    fontSize: 20,
  },
  
  // Zone Summary
  zoneSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  
  // Stats Card
  statsCardContainer: {
    position: 'absolute',
    top: 100,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: '50%',
  },
  widgetsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  zonesScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  zoneSummaryCard: {
    width: 140,
    justifyContent: 'center',
  },
  zoneSummaryTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  zoneBadges: {
    gap: Spacing.xs,
  },
  zoneCard: {
    width: 160,
  },
  zoneCardInner: {
    height: 100,
    justifyContent: 'space-between',
  },
  zoneDistance: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  loopBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  loopBonus: {
    ...Typography.captionSmall,
    color: Colors.territory.contested,
    fontWeight: '600',
  },
  
  // Start Button
  startButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Layout.buttonBorderRadius,
    height: Layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontSize: 18,
  },
  startButtonSubtext: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  toggleRuns: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  toggleRunsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toggleRunsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  
  // Start Button
  startButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
