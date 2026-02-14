import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getActivities, updateActivitySyncStatus } from './activityStorage';
import { API_BASE_URL } from '../../../services/api';

const SYNC_TASK_NAME = 'BACKGROUND_SYNC';

export const syncPendingActivities = async () => {
  console.log('[Sync] Starting syncPendingActivities...');
  const activities = await getActivities();
  console.log(`[Sync] Found ${activities.length} total activities.`);
  
  const pending = activities.filter(
    a =>
      a.syncStatus === 'local_only' ||
      a.syncStatus === 'failed' ||
      a.syncStatus === 'synced' ||
      a.syncStatus === 'finalizing'
  );
  console.log(`[Sync] Found ${pending.length} pending activities.`);

  for (const activity of pending) {
    try {
      console.log(`[Sync] Attempting to sync activity: ${activity.id} to ${API_BASE_URL}/runs`);
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

      console.log(`[Sync] Response status: ${response.status}`);

      if (response.ok) {
        await updateActivitySyncStatus(activity.id, 'synced');
        console.log(`[Sync] Activity ${activity.id} synced successfully!`);

        await updateActivitySyncStatus(activity.id, 'finalizing');
        const finalizeRes = await fetch(`${API_BASE_URL}/runs/${encodeURIComponent(activity.id)}/finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (finalizeRes.ok) {
          await updateActivitySyncStatus(activity.id, 'finalized');
          console.log(`[Sync] Activity ${activity.id} finalized successfully!`);
        } else if (finalizeRes.status >= 400 && finalizeRes.status < 500) {
          await updateActivitySyncStatus(activity.id, 'rejected');
          console.warn(`[Sync] Activity ${activity.id} rejected on finalize.`);
        } else {
          await updateActivitySyncStatus(activity.id, 'failed');
          console.warn(`[Sync] Activity ${activity.id} finalize failed with status ${finalizeRes.status}`);
        }
      } else if (response.status >= 400 && response.status < 500) {
        await updateActivitySyncStatus(activity.id, 'rejected');
        console.warn(`[Sync] Activity ${activity.id} rejected by server.`);
      } else {
        await updateActivitySyncStatus(activity.id, 'failed');
        console.warn(`[Sync] Activity ${activity.id} failed with status ${response.status}`);
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
    // Warn instead of Error since this fails in Expo Go
    console.warn('Background sync registration failed (Expected in Expo Go)', err);
  }
};
