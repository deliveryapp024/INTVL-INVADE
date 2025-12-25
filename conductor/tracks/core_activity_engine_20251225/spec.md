# Specification: Core Activity Engine & Minimalist UI

## Overview
This track focuses on the foundational functional requirement of the application: tracking a running activity and displaying real-time metrics to the user. The goal is to provide a highly accurate, performant, and "instrument-like" interface for runners.

## User Stories
- As a runner, I want to start a session so that the app begins tracking my run.
- As a runner, I want to see my current pace, distance covered, and elapsed time in real-time.
- As a runner, I want to pause and resume my session.
- As a runner, I want to finish my session and see a summary of my performance.

## Functional Requirements
- **GPS Integration:** Utilize `react-native-maps` and native location services to track the user's coordinates.
- **Metric Calculation:**
    - **Time:** Elapsed time since the start (excluding paused periods).
    - **Distance:** Cumulative distance between recorded GPS points (Haversine formula or similar).
    - **Pace:** Current pace (e.g., minutes per kilometer) calculated over a moving window of recent GPS points for stability.
- **Activity Lifecycle Management:** State machine to handle `IDLE`, `TRACKING`, `PAUSED`, and `COMPLETED` states.
- **Data Persistence:** Save completed activity data locally and prepare for backend synchronization.

## Non-Functional Requirements
- **Accuracy:** Minimize GPS noise and ensure distance calculations are within 5% variance of actual movement.
- **Performance:** UI updates (metrics) should happen at least once per second without lag.
- **Battery Efficiency:** Optimize GPS polling frequency and background tasks to prevent excessive drain.
- **Accessibility:** Large, high-contrast typography (WCAG compliant) for easy reading while running.

## User Interface (Minimalist Activity Screen)
- **Aesthetic:** Light-first, high-contrast, performance-minimalist.
- **Layout:**
    - Primary display: Large elapsed time and distance.
    - Secondary display: Current pace.
    - Controls: Prominent "Start", "Pause/Resume", and "Finish" buttons.
- **Accents:** High-energy blue or green accents for the "Start" and "Resume" buttons.
- **Interactions:** Minimal friction; large touch targets for sweaty or moving hands.

## Technical Design
- **Frontend:** React Native (TypeScript) with Expo.
- **State Management:** Zustand for tracking session state and metrics.
- **Location:** `expo-location` for GPS access.
- **Background Tasks:** `expo-task-manager` to ensure tracking continues when the app is in the background.
