import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { calculateDistance, calculatePace } from '../utils/activityUtils';
import { requestLocationPermissions } from '../services/locationService';

export const useActivityTracking = () => {
  const { status, updateMetrics } = useActivityStore();
  const lastLocation = useRef<Location.LocationObject | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          if (lastLocation.current) {
            const distanceDelta = calculateDistance(
              lastLocation.current.coords.latitude,
              lastLocation.current.coords.longitude,
              location.coords.latitude,
              location.coords.longitude
            );

            useActivityStore.getState().updateMetrics({
              distance: useActivityStore.getState().metrics.distance + distanceDelta,
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
  }, [status, updateMetrics]);
};