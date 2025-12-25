# Implementation Plan: Map Route Visualization (MVP)

## Phase 1: Infrastructure & Setup [checkpoint: 7f13859]
- [x] Task: Install and configure `react-native-maps` for iOS and Android. <!-- id: 9148629 -->
- [x] Task: Define minimalist map styling JSON (Light-First). <!-- id: fcbaf45 -->
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Setup' (Protocol in workflow.md) <!-- id: 7f13859 -->

## Phase 2: Core Map Components (TDD) [checkpoint: 6cd0060]
- [x] Task: Create `ActivityRouteMap` component that accepts coordinates, start/end markers, and styling as props. <!-- id: 3f5ec9e -->
- [x] Task: Implement polyline rendering with high-contrast styling. <!-- id: 3f5ec9e -->
- [x] Task: Implement Start and End marker rendering using minimalist design. <!-- id: 3f5ec9e -->
- [x] Task: Implement auto-fit logic using `mapRef.fitToCoordinates`. <!-- id: 3f5ec9e -->
- [x] Task: Conductor - User Manual Verification 'Phase 2: Core Map Components' (Protocol in workflow.md) <!-- id: 6cd0060 -->

## Phase 3: Integration with Activity Summary [checkpoint: e1013c1]
- [x] Task: Modify `ActivityScreen` to retrieve coordinate data from `activityStore`. <!-- id: e3060be -->
- [x] Task: Embed `ActivityRouteMap` as a preview header/section in `ActivityScreen`. <!-- id: 35bbe66 -->
- [x] Task: Implement tap interaction on the preview to trigger navigation. <!-- id: 83e3250 -->
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration with Activity Summary' (Protocol in workflow.md) <!-- id: e1013c1 -->

## Phase 4: Full-Screen Detail View
- [~] Task: Create `FullScreenRouteScreen` using Expo Router.
- [ ] Task: Implement the full-screen layout with a "Back" button and standard map interactions.
- [ ] Task: Ensure coordinate data is passed correctly to the full-screen component.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Full-Screen Detail View' (Protocol in workflow.md)

## Phase 5: Final Polish & UX
- [ ] Task: Refine camera padding for auto-fit to ensure markers aren't cut off.
- [ ] Task: Verify performance and frame rates during map interaction.
- [ ] Task: Final UI audit against "Light-First" minimalist guidelines.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Polish & UX' (Protocol in workflow.md)
