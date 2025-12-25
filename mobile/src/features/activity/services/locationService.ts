import * as Location from 'expo-location';

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }
  return true;
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
