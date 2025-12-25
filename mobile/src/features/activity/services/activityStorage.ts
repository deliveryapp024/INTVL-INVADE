import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ActivityData {
  id: string;
  startTime: number;
  duration: number;
  distance: number;
  pace: number;
}

const STORAGE_KEY = 'activities';

export const saveActivity = async (activity: ActivityData) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const activities: ActivityData[] = existingData ? JSON.parse(existingData) : [];
    activities.push(activity);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activity', e);
  }
};

export const getActivities = async (): Promise<ActivityData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to get activities', e);
    return [];
  }
};