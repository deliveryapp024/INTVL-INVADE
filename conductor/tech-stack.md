# Technology Stack

## Frontend (Mobile)
-   **Framework:** **React Native (TypeScript)** with **Expo Dev Client**.
-   **Workflow:** Expo-managed during development; planned transition to **Bare workflow** for production and scale.
-   **Navigation:** **Expo Router** (file-based routing) for consistent deep linking and simplified navigation management.
-   **State Management:** **Zustand** for lightweight, global UI and domain state.
-   **Data Fetching:** **TanStack Query (React Query)** for caching, background sync, and loading state management.

## Backend & Infrastructure
-   **Environment:** **Node.js (TypeScript)**.
-   **API Style:** REST (initial), with scope to evolve as needed.
-   **Database:** **PostgreSQL** for relational data handling (leaderboards, user stats, streaks).
-   **Caching / Jobs (Future):** Redis for leaderboard caching and background jobs (planned for Phase-2).
-   **Authentication:** Email and OAuth (initial focus).

## Maps & Geospatial
-   **Maps:** `react-native-maps` (Google Maps / Apple Maps integration).
-   **Overlays:** Polygons and Polylines for tracking routes and defining city/territory boundaries.

## Testing & Quality
-   **Frontend:** Jest & React Native Testing Library.
-   **Backend:** Jest for unit/integration tests.
