import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { Colors } from '../../../constants/Colors';
import { Typography } from '../../../constants/Typography';
import { useActivityTracking } from '../hooks/useActivityTracking';
import { saveActivity, ActivityData } from '../services/activityStorage';
import ActivityRouteMap from './ActivityRouteMap';
import { useRouter } from 'expo-router';
import { encodePolyline } from '../utils/activityUtils';
import { syncPendingActivities } from '../services/syncService';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDistance = (meters: number) => {
  return `${(meters / 1000).toFixed(2)} km`;
};

const formatPace = (pace: number) => {
    // Pace is min/km.
    if (!isFinite(pace) || isNaN(pace)) return "0'00\"";
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}'${secs.toString().padStart(2, '0')}"`;
};

export default function ActivityScreen() {
  const { status, metrics, coordinates, startActivity, pauseActivity, resumeActivity, finishActivity, resetActivity } = useActivityStore();
  const router = useRouter();
  
  // Initialize tracking hook
  useActivityTracking();

  const handleFinish = async () => {
    const now = Date.now();
    const activityData: ActivityData = {
        id: `${now}-${Math.floor(Math.random() * 1000)}`,
        startTime: now - (metrics.elapsedTime * 1000),
        endTime: now,
        duration: metrics.elapsedTime,
        distance: metrics.distance,
        pace: metrics.pace,
        activityType: 'RUN',
        polyline: encodePolyline(coordinates),
        rawData: coordinates.map(c => ({
          lat: c.latitude,
          lng: c.longitude,
          time: new Date(c.timestamp).toISOString()
        })),
        syncStatus: 'local_only',
    };
    await saveActivity(activityData);
    syncPendingActivities(); // Fire and forget sync
    finishActivity();
  };

  const handleMapPress = () => {
    router.push('/activity-route');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{formatTime(metrics.elapsedTime)}</Text>
            <Text style={styles.metricLabel}>Duration</Text>
        </View>
        <View style={styles.metricRow}>
            <Text style={styles.metricValue}>{formatDistance(metrics.distance)}</Text>
            <Text style={styles.metricLabel}>Distance</Text>
        </View>
        <View style={styles.metricRow}>
            <Text style={styles.metricSecondaryValue}>{formatPace(metrics.pace)}</Text>
            <Text style={styles.metricLabel}>Pace (/km)</Text>
        </View>
      </View>

      {status === ActivityState.COMPLETED ? (
         <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Run Completed!</Text>
            
            <TouchableOpacity 
              onPress={handleMapPress}
              style={styles.mapPreviewContainer}
              activeOpacity={0.9}
            >
              <ActivityRouteMap 
                coordinates={coordinates} 
                style={styles.mapPreview} 
              />
            </TouchableOpacity>

            <Text style={styles.summaryText}>Your activity has been saved locally.</Text>
            <TouchableOpacity 
                style={[styles.button, styles.startButton]} 
                onPress={resetActivity}
                accessibilityRole="button"
                accessibilityLabel="Start New Run"
            >
                <Text style={styles.buttonText}>New Run</Text>
            </TouchableOpacity>
         </View>
      ) : (
        <View style={styles.controlsContainer}>
            {status === ActivityState.IDLE && (
              <TouchableOpacity 
                style={[styles.button, styles.startButton]} 
                onPress={startActivity}
                accessibilityRole="button"
                accessibilityLabel="Start Activity"
              >
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            )}

            {status === ActivityState.TRACKING && (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.pauseButton]} 
                  onPress={pauseActivity}
                  accessibilityRole="button"
                  accessibilityLabel="Pause Activity"
                >
                  <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.finishButton]} 
                  onPress={handleFinish}
                  accessibilityRole="button"
                  accessibilityLabel="Finish Activity"
                >
                  <Text style={styles.buttonText}>Finish</Text>
                </TouchableOpacity>
              </>
            )}

            {status === ActivityState.PAUSED && (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.resumeButton]} 
                  onPress={resumeActivity}
                  accessibilityRole="button"
                  accessibilityLabel="Resume Activity"
                >
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.finishButton]} 
                  onPress={handleFinish}
                  accessibilityRole="button"
                  accessibilityLabel="Finish Activity"
                >
                  <Text style={styles.buttonText}>Finish</Text>
                </TouchableOpacity>
              </>
            )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  metricsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
    minHeight: 200,
  },
  metricRow: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: Typography.fontSize.giant,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
  },
  metricSecondaryValue: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: Colors.light.accent,
    width: '100%',
  },
  pauseButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resumeButton: {
    backgroundColor: Colors.light.accentSecondary,
  },
  finishButton: {
    backgroundColor: Colors.light.error,
  },
  buttonText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
  },
  summaryContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
  },
  summaryText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  mapPreview: {
    height: 180,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  mapPreviewContainer: {
    width: '100%',
  },
});