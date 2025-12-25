import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveActivity, getActivities, ActivityData } from './activityStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('activityStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save activity', async () => {
    const activity: ActivityData = {
      id: '123',
      startTime: Date.now(),
      duration: 300,
      distance: 1000,
      pace: 5,
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await saveActivity(activity);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'activities',
      JSON.stringify([activity])
    );
  });

  it('should append activity to existing list', async () => {
    const existingActivity: ActivityData = {
      id: '123',
      startTime: Date.now(),
      duration: 300,
      distance: 1000,
      pace: 5,
    };
    const newActivity: ActivityData = {
      id: '456',
      startTime: Date.now(),
      duration: 600,
      distance: 2000,
      pace: 5,
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([existingActivity]));

    await saveActivity(newActivity);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'activities',
      JSON.stringify([existingActivity, newActivity])
    );
  });

  it('should get activities', async () => {
    const activities = [{ id: '123' }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(activities));

    const result = await getActivities();
    expect(result).toEqual(activities);
  });
});
