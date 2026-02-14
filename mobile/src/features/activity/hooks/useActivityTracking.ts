import { useEffect, useRef, useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { calculateDistance, calculatePace } from '../utils/activityUtils';
import { requestLocationPermissions } from '../services/locationService';

// Re-export ActivityState for convenience
export { ActivityState } from '../store/activityStore';

export const useActivityTracking = () => {
  const store = useActivityStore();
  const { status, updateMetrics, addCoordinate, setStatus, reset } = store;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const lastLocation = useRef<Location.LocationObject | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request location permission on mount
  useEffect(() => {
    const getPermission = async () => {
      const granted = await requestLocationPermissions();
      setHasPermission(granted);
      
      if (granted) {
        // Get initial location
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentLocation(location);
          lastLocation.current = location;
        } catch (error) {
          console.log('Initial location error:', error);
        }
      }
    };
    
    getPermission();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          const { metrics } = useActivityStore.getState();
          
          // Update current location state
          setCurrentLocation(location);
          
          addCoordinate({
            latitude,
            longitude,
            timestamp: Date.now(),
          });

          if (lastLocation.current) {
            const distance = calculateDistance(
              lastLocation.current.coords.latitude,
              lastLocation.current.coords.longitude,
              latitude,
              longitude
            );

            const newDistance = metrics.distance + distance;
            const newPace = calculatePace(newDistance, metrics.elapsedTime);

            updateMetrics({
              distance: newDistance,
              pace: newPace,
            });
          }

          lastLocation.current = location;
        }
      );
    };

    if (status === ActivityState.TRACKING) {
      startTracking();
      timerRef.current = setInterval(() => {
        const currentMetrics = useActivityStore.getState().metrics;
        const newTime = currentMetrics.elapsedTime + 1;
        const newPace = calculatePace(currentMetrics.distance, newTime);
        updateMetrics({
          elapsedTime: newTime,
          pace: newPace,
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      subscription?.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, updateMetrics, addCoordinate]);

  // Control functions
  const startActivity = useCallback(() => {
    setStatus(ActivityState.TRACKING);
  }, [setStatus]);

  const pauseActivity = useCallback(() => {
    setStatus(ActivityState.PAUSED);
  }, [setStatus]);

  const resumeActivity = useCallback(() => {
    setStatus(ActivityState.TRACKING);
  }, [setStatus]);

  const stopActivity = useCallback(() => {
    setStatus(ActivityState.COMPLETED);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [setStatus]);

  return {
    status,
    metrics: store.metrics,
    currentLocation,
    hasPermission,
    routeCoordinates: store.coordinates,
    zones: store.zones || [],
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    reset,
  };
};
