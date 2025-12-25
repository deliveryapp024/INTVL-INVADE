# Specification: Run Finalization & Integrity Layer

## Overview
This track implements a robust validation and metric-derivation layer for activity tracking. It ensures that run data is deterministic, verified by the server, and protected against exploitation before it affects game mechanics like territories or leaderboards.

## Functional Requirements

### 1. Run Lifecycle Management
- Update the `Run` schema to include a `status` field:
  - `PENDING`: Initial state upon raw data upload.
  - `PROCESSING`: Transitionary state during metric calculation (optional but reserved for future job queues).
  - `FINALIZED`: Validated, metrics computed, and locked.
  - `REJECTED`: Failed validation or suspicious data.
- **Transition Rule:** A run may transition out of `PENDING` only once to ensure immutability.
- Add a `reject_reason` field to store why a run was marked as `REJECTED`.
- Add a `computed_metrics` JSON field (or specific columns) to store:
  - `distance_m`: Total distance in meters (derived using Haversine formula).
  - `duration_s`: Total duration in seconds (derived from GPS timestamps).
  - `avg_pace`: Calculated as `duration_s / (distance_m / 1000)`.
  - `max_speed`: Peak speed recorded between any two points.

### 2. Finalization API
- Implement `POST /api/runs/:id/finalize`:
  - **Authorization:** Only the owner of the run can finalize it.
  - **Idempotency:** A run that is already `FINALIZED` or `REJECTED` cannot be processed again.
    - Returns `200 OK` with the *existing* persisted run object.
    - No recalculation or database updates occur on repeated calls.
  - **Trigger:** This endpoint initiates the server-side metric derivation and validation logic.

### 3. Server-Side Metric Derivation
- **Pre-requisite:** `raw_data` GPS points must be sorted chronologically by timestamp *prior* to any computation to handle potential out-of-order uploads.
- **Client Data Policy:** Client-provided summary stats (distance, duration, etc.) are **ignored** after ingestion. `computed_metrics` are the only source of truth.
- **Distance Calculation:** Use the Haversine formula to sum distances between sequential GPS points in `raw_data`.
- **Duration Calculation:** Difference between the first and last GPS point timestamps.
- **Speed Calculation:** Velocity between each pair of points to find `max_speed`.

### 4. Anti-Cheat & Integrity Validation (v0)
A run is marked `REJECTED` if it fails any of these checks. Specific rejection codes must be used:
- **Max Speed:** Any segment exceeds `6.5 m/s` -> `UNREALISTIC_SPEED`.
- **Min Duration:** Total duration is less than `120 seconds` (2 minutes) -> `INSUFFICIENT_DURATION`.
- **Min Distance:** Total distance is less than `300 meters` -> `INSUFFICIENT_DISTANCE`.
- **GPS Integrity (Gap Rule):**
  - Time gap between any two sequential points is `> 30 seconds` -> `GPS_TIME_GAP_TOO_LARGE`.
  - Distance jump between any two sequential points is `> 100 meters` -> `GPS_DISTANCE_JUMP_TOO_LARGE`.

### 5. Data Integrity
- Ensure `computed_metrics` are the only source of truth for game mechanics.
- `FINALIZED` runs are immutable.

## Non-Functional Requirements
- **Precision:** Use double-precision floats for distance calculations.
- **Determinism:** Given identical `raw_data`, finalization must always produce identical `computed_metrics` and lifecycle outcome.
- **Error Handling:** Provide specific error codes for different rejection reasons in the API response.

## Acceptance Criteria
- [ ] `POST /api/runs/:id/finalize` returns `200 OK` with the finalized run object on success.
- [ ] A run with a segment speed of 10 m/s is correctly marked `REJECTED` with reason `UNREALISTIC_SPEED`.
- [ ] A run with a 40-second GPS gap is correctly marked `REJECTED` with reason `GPS_TIME_GAP_TOO_LARGE`.
- [ ] A run with a 150-meter GPS jump is correctly marked `REJECTED` with reason `GPS_DISTANCE_JUMP_TOO_LARGE`.
- [ ] Duplicate calls to the finalize endpoint return the same result without re-calculating (Idempotency).
- [ ] Database reflects derived metrics, not client-provided values.
- [ ] GPS points are sorted by timestamp before processing.

## Out of Scope
- Real-time pause detection (manual pauses in raw data).
- Elevation gain/loss calculations.
- Advanced heart rate or cadence validation.
- Background job processing (Redis/Sidekiq/BullMQ) - logic will be synchronous within the finalize request for now.
