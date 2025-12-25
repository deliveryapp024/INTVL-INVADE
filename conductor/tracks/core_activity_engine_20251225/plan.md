# Plan: Core Activity Engine & Minimalist UI

## Phase 1: Foundation & State Management
- [x] Task: Set up initial React Native project with Expo Dev Client 08ba358
- [ ] Task: Configure basic folder structure following feature-based architecture
- [ ] Task: Implement activity state machine using Zustand (IDLE, TRACKING, PAUSED, COMPLETED)
- [ ] Task: Conductor - User Manual Verification 'Foundation & State Management' (Protocol in workflow.md)

## Phase 2: Location & Tracking Logic
- [ ] Task: Write tests for distance and pace calculation utilities
- [ ] Task: Implement distance and pace calculation utilities (Green Phase)
- [ ] Task: Set up `expo-location` permissions and foreground tracking
- [ ] Task: Write tests for the activity tracking service/hook
- [ ] Task: Implement the activity tracking service/hook to update state with GPS data
- [ ] Task: Implement background tracking using `expo-task-manager`
- [ ] Task: Conductor - User Manual Verification 'Location & Tracking Logic' (Protocol in workflow.md)

## Phase 3: Minimalist Activity Screen (UI)
- [ ] Task: Create typography and color constants based on Product Guidelines
- [ ] Task: Write tests for the Activity Screen UI components (checking for metric display)
- [ ] Task: Build the Minimalist Activity Screen layout (elapsed time, distance, pace)
- [ ] Task: Implement Start, Pause, Resume, and Finish controls with high-contrast accents
- [ ] Task: Ensure accessibility compliance (touch targets, contrast ratios)
- [ ] Task: Conductor - User Manual Verification 'Minimalist Activity Screen (UI)' (Protocol in workflow.md)

## Phase 4: Activity Completion & Local Storage
- [ ] Task: Write tests for activity saving logic
- [ ] Task: Implement logic to finalize and save activity data to local storage (AsyncStorage or similar)
- [ ] Task: Build a basic activity summary component/screen
- [ ] Task: Conductor - User Manual Verification 'Activity Completion & Local Storage' (Protocol in workflow.md)
