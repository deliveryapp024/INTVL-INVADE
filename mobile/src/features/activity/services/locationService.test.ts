import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { requestLocationPermissions, startBackgroundTracking, stopBackgroundTracking } from './locationService';

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request permissions', async () => {
    (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const granted = await requestLocationPermissions();
    expect(granted).toBe(true);
  });

  it('should start background tracking if not registered', async () => {
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
    await startBackgroundTracking();
    expect(Location.startLocationUpdatesAsync).toHaveBeenCalled();
  });

  it('should stop background tracking if registered', async () => {
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
    await stopBackgroundTracking();
    expect(Location.stopLocationUpdatesAsync).toHaveBeenCalled();
  });
});
