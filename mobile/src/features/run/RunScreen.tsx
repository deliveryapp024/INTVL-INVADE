/**
 * Run Screen - Complete Running Experience
 * Live tracking, countdown, completion celebration
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Confetti } from '../../components/Confetti';
import { BounceIn, ScaleIn, FadeIn } from '../../components/FadeIn';
import {
  SpinningTrophy,
  AnimatedCounter,
  PressableScale,
} from '../../components/animations';
import { SOSButtonCompact } from '../../components/SOSButton';
import { CompleteRunModal } from '../../components/CompleteRunModal';
import { ShareService } from '../../services/ShareService';
import { FeedbackService } from '../../services/FeedbackService';
import { NotificationService } from '../../services/NotificationService';
import { Colors } from '../../theme/Colors';
import { HapticsPreset } from '../../utils/haptics';
import { usePerformanceTracking } from '../../utils/PerformanceMonitor';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useActivityTracking, ActivityState } from '../activity/hooks/useActivityTracking';
import MapView, { Polyline, Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Voice coach messages
const COACH_MESSAGES = {
  start: ["Let's do this!", "Time to own the streets!", "Ready to conquer?"],
  zone: ["Zone captured! Keep going!", "Another one! You're unstoppable!", "That's how we do it!"],
  halfway: ["Halfway there! Don't stop now!", "You're crushing it!", "Almost there! Keep pushing!"],
  finish: ["LEGENDARY! Zone captured!", "YOU OWN THIS ZONE!", "CHAMPION MODE ACTIVATED!"],
};

export default function RunScreen() {
  const insets = useSafeAreaInsets();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  
  const {
    status,
    metrics,
    currentLocation,
    hasPermission,
    routeCoordinates,
    zones,
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    reset,
  } = useActivityTracking();

  // Initialize feedback
  useEffect(() => {
    FeedbackService.init();
  }, []);

  // Format time as mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format distance as km
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  // Format pace as min/km
  const formatPace = (secondsPerKm: number | null) => {
    if (!secondsPerKm || secondsPerKm === Infinity) return "--'--";
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.round(secondsPerKm % 60);
    return `${mins}'${secs.toString().padStart(2, '0')}"`;
  };

  // Get random coach message
  const getCoachMessage = (type: keyof typeof COACH_MESSAGES) => {
    const messages = COACH_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Start run with countdown
  const handleStart = useCallback(async () => {
    setCoachMessage(getCoachMessage('start'));
    
    // Countdown sequence
    for (let i = 3; i >= 1; i--) {
      setCountdown(i as 1 | 2 | 3);
      await FeedbackService.countdown(i as 1 | 2 | 3);
      await FeedbackService.playCountdown(i as 1 | 2 | 3);
      await delay(1000);
    }
    
    setCountdown('GO' as any);
    await FeedbackService.countdown('go');
    await FeedbackService.playCountdown('go');
    await FeedbackService.heavyTap();
    
    await delay(500);
    setCountdown(null);
    startActivity();
  }, [startActivity]);

  // Stop run with celebration
  const handleStop = useCallback(async () => {
    await FeedbackService.mediumTap();
    setShowCompleteModal(true);
  }, []);

  const handleConfirmComplete = async () => {
    setShowCompleteModal(false);
    stopActivity();
    setShowCelebration(true);
    await FeedbackService.fullCelebration();
    
    // Schedule streak warning for tomorrow evening
    // This reminds user to run again to keep their streak
    await NotificationService.scheduleStreakWarning(7); // Assuming 7-day streak
  };

  const handleKeepRunning = async () => {
    await FeedbackService.lightTap();
    setShowCompleteModal(false);
  };

  const handleNewRun = async () => {
    await FeedbackService.buttonPress('medium');
    reset();
    setShowCelebration(false);
    // Navigate back to home
    router.back();
  };

  // Share run
  const handleShare = useCallback(async () => {
    await FeedbackService.buttonPress('medium');
    await ShareService.shareRun({
      distance: metrics.distance,
      duration: metrics.elapsedTime,
      pace: metrics.pace,
    });
  }, [metrics]);

  // Render countdown overlay
  if (countdown !== null) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="dark" />
        <BounceIn key={countdown}>
          <Text style={styles.countdownNumber}>
            {countdown === ('GO' as any) ? 'GO!' : countdown}
          </Text>
        </BounceIn>
        {coachMessage && (
          <FadeIn delay={200}>
            <Text style={styles.coachMessage}>{coachMessage}</Text>
          </FadeIn>
        )}
      </View>
    );
  }

  // Render completion screen
  if (status === ActivityState.COMPLETED) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Confetti active={showCelebration} count={80} />
        
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <ScaleIn delay={100}>
            <View style={styles.trophyContainer}>
              <SpinningTrophy active={showCelebration} size={48} color={Colors.warning} />
            </View>
          </ScaleIn>
          
          <ScaleIn delay={200}>
            <Text style={styles.completionTitle}>ZONE CAPTURED!</Text>
          </ScaleIn>
          
          <FadeIn delay={300}>
            <Text style={styles.completionSubtitle}>
              {getCoachMessage('finish')}
            </Text>
          </FadeIn>
        </View>

        <View style={styles.statsGrid}>
          <ScaleIn delay={400}>
            <Card style={styles.statCard} elevation="large">
              <Icon name="time" size={28} color={Colors.primary} />
              <Text style={styles.statValueLarge}>{formatTime(metrics.elapsedTime)}</Text>
              <Text style={styles.statLabelLarge}>Duration</Text>
            </Card>
          </ScaleIn>

          <ScaleIn delay={500}>
            <Card style={styles.statCard} elevation="large">
              <Icon name="map" size={28} color={Colors.secondary} />
              <Text style={styles.statValueLarge}>{formatDistance(metrics.distance)}</Text>
              <Text style={styles.statLabelLarge}>Distance</Text>
            </Card>
          </ScaleIn>

          <ScaleIn delay={600}>
            <Card style={styles.statCard} elevation="large">
              <Icon name="speedometer" size={28} color={Colors.success} />
              <Text style={styles.statValueLarge}>{formatPace(metrics.pace)}</Text>
              <Text style={styles.statLabelLarge}>Pace</Text>
            </Card>
          </ScaleIn>
        </View>

        <FadeIn delay={700}>
          <View style={styles.actionButtons}>
            <PressableScale onPress={handleShare}>
              <Button
                title="Share Victory"
                onPress={handleShare}
                variant="primary"
                icon={<Icon name="share" size={20} color="#FFF" />}
                style={styles.shareButton}
              />
            </PressableScale>
            <PressableScale onPress={handleNewRun}>
              <Button
                title="New Run"
                onPress={handleNewRun}
                variant="secondary"
                icon={<Icon name="refresh" size={20} color={Colors.primary} />}
              />
            </PressableScale>
          </View>
        </FadeIn>
      </View>
    );
  }

  // Render active run screen
  const isRunning = status === ActivityState.TRACKING;
  const isPaused = status === ActivityState.PAUSED;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Map */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            region={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {/* Route */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={Colors.primary}
                strokeWidth={4}
              />
            )}
            
            {/* Current Position */}
            <Marker coordinate={{ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude }}>
              <View style={styles.currentLocation}>
                <View style={styles.currentLocationInner} />
              </View>
            </Marker>
            
            {/* Zones */}
            {zones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={{ latitude: zone.latitude, longitude: zone.longitude }}
                  radius={zone.radius}
                  fillColor={zone.captured ? Colors.success + '30' : Colors.primary + '20'}
                  strokeColor={zone.captured ? Colors.success : Colors.primary}
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                >
                  <View style={[
                    styles.zoneMarker,
                    zone.captured && styles.zoneMarkerCaptured
                  ]}>
                    <Icon
                      name={zone.captured ? "checkmark" : "flag"}
                      size={16}
                      color="#FFF"
                    />
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>
        ) : (
          <View style={[styles.map, styles.mapLoading]}>
            {hasPermission === false ? (
              <>
                <Icon name="location" size={48} color={Colors.textMuted} />
                <Text style={styles.loadingText}>Location permission needed</Text>
                <Text style={styles.loadingSubtext}>Enable location to track your runs</Text>
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Getting location...</Text>
                <Text style={styles.loadingSubtext}>Please wait while we find you</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Stats Overlay */}
      <View style={[styles.statsOverlay, { top: insets.top + 16 }]}>
        <Card style={styles.statsCard} elevation="medium">
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(metrics.elapsedTime)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(metrics.distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatPace(metrics.pace)}</Text>
              <Text style={styles.statLabel}>Pace</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Zone Progress */}
      <View style={[styles.zoneProgress, { bottom: insets.bottom + 120 }]}>
        <Card style={styles.zoneCard} elevation="small">
          <View style={styles.zoneHeader}>
            <Icon name="flag" size={18} color={Colors.warning} />
            <Text style={styles.zoneText}>
              {zones.filter(z => z.captured).length}/{zones.length} Zones
            </Text>
          </View>
          <View style={styles.zoneBar}>
            <View 
              style={[
                styles.zoneFill, 
                { width: `${(zones.filter(z => z.captured).length / zones.length) * 100}%` }
              ]} 
            />
          </View>
        </Card>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        {!isRunning && !isPaused ? (
          <Button
            title="START ZONE CAPTURE"
            onPress={handleStart}
            variant="primary"
            size="large"
            icon={<Icon name="play" size={24} color="#FFF" />}
          />
        ) : (
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Icon name="square" size={28} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.mainButton]}
              onPress={async () => {
                await FeedbackService.buttonPress('medium');
                isPaused ? resumeActivity() : pauseActivity();
              }}
            >
              <Icon
                name={isPaused ? "play" : "pause"}
                size={36}
                color="#FFF"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.feedbackButton]}
              onPress={async () => {
                await FeedbackService.fullCelebration();
              }}
            >
              <Icon name="sparkles" size={24} color={Colors.primary} />
            </TouchableOpacity>
            
            {/* SOS Button */}
            <SOSButtonCompact />
          </View>
        )}
      </View>

      {/* Complete Run Modal */}
      <CompleteRunModal
        visible={showCompleteModal}
        onKeepRunning={handleKeepRunning}
        onComplete={handleConfirmComplete}
        elapsedTime={metrics.elapsedTime}
        distance={metrics.distance}
      />
    </View>
  );
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Countdown styles
  countdownNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: Colors.primary,
    textAlign: 'center',
  },
  coachMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 24,
  },
  // Completion styles
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  trophyContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 2,
  },
  completionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  statCard: {
    width: (width - 56) / 3,
    padding: 16,
    alignItems: 'center',
  },
  statValueLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabelLarge: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtons: {
    padding: 24,
    gap: 12,
  },
  shareButton: {
    backgroundColor: Colors.success,
  },
  // Map styles
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  currentLocation: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  zoneMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneMarkerCaptured: {
    backgroundColor: Colors.success,
  },
  // Stats overlay
  statsOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  statsCard: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  // Zone progress
  zoneProgress: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  zoneCard: {
    padding: 12,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  zoneBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  zoneFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  // Controls
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  mainButton: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  stopButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.error,
  },
  feedbackButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
});
