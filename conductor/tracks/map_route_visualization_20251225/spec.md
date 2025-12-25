# Specification: Map Route Visualization (MVP)

## Overview
Implement a map-based visualization for completed running activities. This feature allows users to see their recorded routes clearly on a map, reinforcing trust in tracking data and providing a visual summary of their performance.

## User Flow
1. **Activity Summary (Embedded):** After finishing a run or viewing a past activity on the `ActivityScreen`, a map preview is embedded as a section/header showing the route.
2. **Detailed View (Full-Screen):** Tapping the embedded map opens a dedicated, full-screen route exploration view.

## Functional Requirements
- **Route Rendering:** Use a high-contrast polyline (e.g., "India Orange" or "Action Blue") to display the recorded GPS path.
- **Markers:** Display minimalist markers for the Start (green circle) and End (red circle/flag) points.
- **Auto-fit:** The map camera must automatically adjust its bounds to fit the entire route (Start to End) upon loading.
- **Interaction:** 
    - Embedded Map: Static or limited interaction (tapping opens full-screen).
    - Full-Screen View: Standard map gestures (pan, zoom).
- **Styling:** Clean, minimalist map styling that respects "Light-First" design principles, ensuring the route remains the primary focus.

## Technical Requirements
- **Library:** `react-native-maps`.
- **Providers:** Google Maps (Android), Apple Maps/Google Maps (iOS).
- **Data Flow:** The `ActivityScreen` will retrieve GPS coordinates from `activityStore` or `activityStorage` and pass them as props to the Map component.
- **Performance:** Ensure smooth rendering of polylines without frame drops, even for longer runs.

## Acceptance Criteria
- [ ] A completed activity reliably displays its route on the `ActivityScreen` map preview.
- [ ] Tapping the preview opens a full-screen map showing the same route.
- [ ] Route polyline is high-contrast and legible in daylight.
- [ ] Start and end points are clearly marked.
- [ ] Map camera auto-fits to the route bounds for both short and long runs.
- [ ] UI adheres to minimalist design guidelines.

## Out of Scope
- Real-time route drawing during an active run.
- Territory/zone capture or city overlays.
- Heatmaps or multi-run comparisons.
- Social sharing integrations.
- Backend persistence (data is consumed from local storage).
