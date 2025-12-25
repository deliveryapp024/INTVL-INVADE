import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useActivityStore, ActivityState } from '../store/activityStore';
import { calculateDistance } from '../utils/activityUtils';

export const LOCATION_TRACKING_TASK = 'LOCATION_TRACKING_TASK';

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === 'granted';
};

export const startForegroundTracking = async (callback: (location: Location.LocationObject) => void) => {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
    },
    callback
  );
};

export const startBackgroundTracking = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);
  if (!isRegistered) {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: "INVTL is tracking your run",
        notificationBody: "Keep moving!",
        notificationColor: "#ffffff",
      },
    });
  }
};

export const stopBackgroundTracking = async () => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
  }
};

let lastBackgroundLocation: Location.LocationObject | null = null;

TaskManager.defineTask(LOCATION_TRACKING_TASK, ({ data, error }) => {
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    if (location) {
      const state = useActivityStore.getState();
      if (state.status === ActivityState.TRACKING && lastBackgroundLocation) {
        const distanceDelta = calculateDistance(
          lastBackgroundLocation.coords.latitude,
          lastBackgroundLocation.coords.longitude,
          location.coords.latitude,
          location.coords.longitude
        );
        state.updateMetrics({
          distance: state.metrics.distance + distanceDelta,
        });
      }
      lastBackgroundLocation = location;
    }
  }
});