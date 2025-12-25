import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getActivities, updateActivitySyncStatus } from './activityStorage';

const API_BASE_URL = 'http://localhost:3001/api'; 
const SYNC_TASK_NAME = 'BACKGROUND_SYNC';

export const syncPendingActivities = async () => {
  const activities = await getActivities();
  const pending = activities.filter(a => a.syncStatus === 'local_only' || a.syncStatus === 'failed');

  for (const activity of pending) {
    try {
      await updateActivitySyncStatus(activity.id, 'syncing');
      
      const response = await fetch(`${API_BASE_URL}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activity.id,
          start_time: new Date(activity.startTime).toISOString(),
          end_time: activity.endTime ? new Date(activity.endTime).toISOString() : new Date().toISOString(),
          duration: activity.duration,
          distance: activity.distance,
          activity_type: activity.activityType || 'RUN',
          polyline: activity.polyline,
          raw_data: activity.rawData || [],
          metadata: activity.metadata || {}
        }),
      });

      if (response.ok) {
        await updateActivitySyncStatus(activity.id, 'synced');
      } else if (response.status >= 400 && response.status < 500) {
        await updateActivitySyncStatus(activity.id, 'rejected');
      } else {
        await updateActivitySyncStatus(activity.id, 'failed');
      }
    } catch (e) {
      console.error('Sync failed for activity', activity.id, e);
      await updateActivitySyncStatus(activity.id, 'failed');
    }
  }
};

// Background Task Definition
TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  try {
    await syncPendingActivities();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync task failed', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Registration Helper
export const registerBackgroundSync = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background sync task registered');
  } catch (err) {
    console.error('Background sync registration failed', err);
  }
};
