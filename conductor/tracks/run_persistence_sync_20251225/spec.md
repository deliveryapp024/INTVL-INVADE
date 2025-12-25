# Specification: Run Persistence & Backend Sync

## Overview
This track establishes the backend as the single source of truth for user activities. It focuses on reliably persisting completed runs from the mobile app to a Node.js/PostgreSQL backend, ensuring data integrity through idempotency, handling offline-first synchronization, and providing foundational APIs for activity history. This infrastructure is critical for future features like leaderboards and zone ownership.

## Functional Requirements
- **Reliable Persistence:** Persist run metadata (distance, duration, timestamps, activity type) and GPS path data.
- **Hybrid Geospatial Storage:**
    - Store high-fidelity raw GPS data (latitude, longitude, timestamp, accuracy, altitude) in a dedicated storage structure (e.g., object storage or a separate heavy column), optimized for infrequent access.
    - Store a simplified encoded polyline in the primary `runs` table for fast map rendering.
- **Idempotency:** 
    - Prevent duplicate run submissions using client-generated UUIDs enforced at the database level.
    - Duplicate submissions with the same UUID return a successful response without reprocessing.
- **Offline-First Sync:**
    - Queue unsynced runs locally on the mobile device.
    - Automatic sync triggers: Immediate completion, App Launch/Foreground, and Periodic Background Tasks.
- **Data Integrity & Anti-Gaming:**
    - Validate runs based on distance, duration, and activity type.
    - Flag runs that overlap in time with existing runs for the same user.
    - Flagged (overlapping) runs are excluded from competitive calculations by default.
- **History API:** Provide paginated and filterable endpoints for users to retrieve their run history.

## Non-Functional Requirements
- **Consistency:** Backend must be the authoritative source once a run is synced.
- **Performance:** Sync logic must not block the mobile UI.
- **Scalability:** Schema design must accommodate growth in run data and future competitive features.

## Acceptance Criteria
- [ ] A run completed on mobile is successfully saved to the PostgreSQL database with all metadata and path data.
- [ ] Retrying a successful run submission (with the same UUID) returns a successful, deterministic response without creating a duplicate or reprocessing.
- [ ] Runs recorded while offline are automatically synced when connectivity is restored (on app foreground or background task).
- [ ] Overlapping runs are successfully stored but marked with an `overlapping` flag.
- [ ] The history API returns the correct list of synced runs for a user, sorted by date.

## Out of Scope
- Zone ownership or territory capture logic.
- Leaderboard ranking or social feed integration.
- Real-time streaming of GPS coordinates during a run.
- Refinement of GPS accuracy or advanced anti-cheat heuristics.
