# Implementation Plan - Run Persistence & Backend Sync

## Phase 1: Data Model & Schema Design [checkpoint: 3f9563b]
- [x] Task: Design and document the PostgreSQL schema for the `runs` table, including columns for UUID, user ID, timestamps, distance, duration, and metadata. [d80fd71]
- [x] Task: Define the storage strategy for raw GPS coordinates (e.g., separate table vs. JSONB column) and the simplified polyline. [fc75e80]
- [x] Task: Define database constraints and indices, specifically enforcing uniqueness on the run UUID. [099155b]
- [x] Task: Define run lifecycle/status fields (e.g., `local_only`, `syncing`, `synced`, `failed`) for reconciliation. [635d4a9]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Model & Schema Design' (Protocol in workflow.md) [3f9563b]

## Phase 2: API Contracts (Design-First)
- [x] Task: Define the REST API endpoint for run submission (e.g., `POST /api/runs`). [f2341d0]
- [~] Task: Define the JSON request payload structure, including the idempotency key (UUID) and run data.
- [ ] Task: Define idempotent response behavior (duplicate UUID returns 200 OK with existing run reference).
- [ ] Task: Document the "overlapping run" flag logic in the API contract.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: API Contracts' (Protocol in workflow.md)

## Phase 3: Backend Implementation (Run Ingestion)
- [ ] Task: Set up the database migration for the new `runs` schema and any related tables.
- [ ] Task: Implement the `POST /api/runs` endpoint in Node.js.
- [ ] Task: Implement the idempotency check using the UUID; ensure existing runs return success without reprocessing.
- [ ] Task: Separate validation logic from persistence logic to ensure failed runs are not partially stored.
- [ ] Task: Implement logic to detect overlapping runs and set the `overlapping` flag.
- [ ] Task: Implement storage logic for both the simplified polyline and raw GPS data.
- [ ] Task: Write unit and integration tests for the ingestion endpoint (success, duplicate, overlap, invalid data).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Backend Implementation (Run Ingestion)' (Protocol in workflow.md)

## Phase 4: Mobile → Backend Sync Logic
- [ ] Task: Implement a local queue or status flag in the mobile app's local storage to track unsynced runs.
- [ ] Task: Implement the sync service function to `POST` pending runs to the backend.
- [ ] Task: Implement the "Immediate Completion" sync trigger.
- [ ] Task: Implement the "App Launch/Foreground" sync trigger.
- [ ] Task: Document platform limitations and fallback behavior for background sync (Expo / OS constraints).
- [ ] Task: Implement a basic "Periodic Background" sync task (using platform-appropriate background fetch APIs).
- [ ] Task: Handle network errors and retries gracefully without blocking the UI.
- [ ] Task: Update local run status to "synced" upon successful backend response.
- [ ] Task: Write unit tests for the sync service and queue logic.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Mobile → Backend Sync Logic' (Protocol in workflow.md)

## Phase 5: Read APIs (Foundational)
- [ ] Task: Implement `GET /api/runs` endpoint for fetching user history.
- [ ] Task: Add support for pagination (limit/offset or cursor) and sorting (descending date).
- [ ] Task: Add support for date range filtering.
- [ ] Task: Exclude flagged (overlapping) runs from competitive responses by default.
- [ ] Task: Ensure the response includes the simplified polyline for map display.
- [ ] Task: Write tests for the history endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Read APIs (Foundational)' (Protocol in workflow.md)
