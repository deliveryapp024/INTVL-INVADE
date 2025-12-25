import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncStatus = 'local_only' | 'syncing' | 'synced' | 'failed' | 'rejected';

export interface ActivityData {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number;
  distance: number;
  pace: number;
  activityType?: string;
  polyline?: string;
  rawData?: any[];
  metadata?: any;
  syncStatus: SyncStatus;
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

export const updateActivitySyncStatus = async (id: string, status: SyncStatus) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const activities: ActivityData[] = existingData ? JSON.parse(existingData) : [];
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index].syncStatus = status;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  } catch (e) {
    console.error('Failed to update activity sync status', e);
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