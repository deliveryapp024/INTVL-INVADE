# Plan: Core Activity Engine & Minimalist UI

## Phase 1: Foundation & State Management [checkpoint: f56678b]
- [x] Task: Set up initial React Native project with Expo Dev Client 08ba358
- [x] Task: Configure basic folder structure following feature-based architecture a8385f8
- [x] Task: Implement activity state machine using Zustand (IDLE, TRACKING, PAUSED, COMPLETED) 3e3cb5c
- [x] Task: Conductor - User Manual Verification 'Foundation & State Management' (Protocol in workflow.md) f56678b

## Phase 2: Location & Tracking Logic [checkpoint: 793f258]
- [x] Task: Write tests for distance and pace calculation utilities e78473c
- [x] Task: Implement distance and pace calculation utilities (Green Phase) e78473c
- [x] Task: Set up `expo-location` permissions and foreground tracking cd39f2c
- [x] Task: Write tests for the activity tracking service/hook ec4baca
- [x] Task: Implement the activity tracking service/hook to update state with GPS data ec4baca
- [x] Task: Implement background tracking using `expo-task-manager` e82d059
- [x] Task: Conductor - User Manual Verification 'Location & Tracking Logic' (Protocol in workflow.md) 793f258

## Phase 3: Minimalist Activity Screen (UI)
- [x] Task: Create typography and color constants based on Product Guidelines c0d71d4
- [x] Task: Write tests for the Activity Screen UI components (checking for metric display) ed5a32b
- [x] Task: Build the Minimalist Activity Screen layout (elapsed time, distance, pace) ed5a32b
- [x] Task: Implement Start, Pause, Resume, and Finish controls with high-contrast accents ed5a32b
- [x] Task: Ensure accessibility compliance (touch targets, contrast ratios) ed5a32b
- [ ] Task: Conductor - User Manual Verification 'Minimalist Activity Screen (UI)' (Protocol in workflow.md)

## Phase 4: Activity Completion & Local Storage
- [ ] Task: Write tests for activity saving logic
- [ ] Task: Implement logic to finalize and save activity data to local storage (AsyncStorage or similar)
- [ ] Task: Build a basic activity summary component/screen
- [ ] Task: Conductor - User Manual Verification 'Activity Completion & Local Storage' (Protocol in workflow.md)
