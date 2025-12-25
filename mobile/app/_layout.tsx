import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { syncPendingActivities, registerBackgroundSync } from '../src/features/activity/services/syncService';

export default function Layout() {
  useEffect(() => {
    // Register background task
    registerBackgroundSync();

    // Initial sync on app launch
    syncPendingActivities();

    // Sync on foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        syncPendingActivities();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return <Stack />;
}