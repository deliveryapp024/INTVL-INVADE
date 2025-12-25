import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveActivity, getActivities, ActivityData, updateActivitySyncStatus } from './activityStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('activityStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockActivity: ActivityData = {
    id: '123',
    startTime: 1000000,
    duration: 300,
    distance: 1000,
    pace: 5,
    syncStatus: 'local_only',
  };

  it('should save activity', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await saveActivity(mockActivity);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'activities',
      JSON.stringify([mockActivity])
    );
  });

  it('should append activity to existing list', async () => {
    const newActivity: ActivityData = {
      ...mockActivity,
      id: '456',
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockActivity]));

    await saveActivity(newActivity);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'activities',
      JSON.stringify([mockActivity, newActivity])
    );
  });

  it('should get activities', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockActivity]));

    const result = await getActivities();
    expect(result).toEqual([mockActivity]);
  });

  it('should update activity sync status', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([mockActivity]));

    await updateActivitySyncStatus('123', 'synced');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'activities',
      JSON.stringify([{ ...mockActivity, syncStatus: 'synced' }])
    );
  });
});