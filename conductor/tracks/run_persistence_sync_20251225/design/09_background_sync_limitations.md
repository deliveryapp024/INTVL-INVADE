# Background Sync: Platform Limitations & Fallbacks

## Overview
Reliable background synchronization on mobile is subject to operating system constraints designed to preserve battery life and performance.

## Platform Constraints

### iOS
- **Frequency:** The OS determines when `Background Fetch` tasks run based on user patterns. It is not guaranteed to run at a specific interval.
- **Execution Time:** Background tasks typically have a maximum of 30 seconds to complete.
- **Connectivity:** If the device has no network, the task may be deferred or fail.

### Android
- **Battery Optimization:** "Doze Mode" and "App Standby" can defer background tasks unless the app is exempted.
- **WorkManager:** We use `WorkManager` (via Expo) which is robust but still subject to OS scheduling.

## Expo Implementation (`expo-background-fetch`)
- We register a task named `BACKGROUND_SYNC_TASK`.
- The task attempts to call `syncPendingActivities()`.
- Limitations: In the "Managed Workflow", Expo background tasks might be less frequent than in "Bare Workflow".

## Fallback Strategy
Because background sync is "best effort", we rely on the following deterministic triggers:
1.  **Immediate Sync:** Triggered the moment an activity is finished.
2.  **App Launch Sync:** Triggered every time the app is opened.
3.  **Foreground Sync:** Triggered when the app returns from the background.

## User Experience
- The UI should indicate if an activity is "Pending Sync".
- A manual "Sync Now" button in the History screen (future track) will provide a definitive way for users to ensure data is uploaded.
