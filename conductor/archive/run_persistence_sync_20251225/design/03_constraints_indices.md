# Database Constraints & Indices

## Constraints

1.  **Primary Key (Idempotency)**
    -   `ALTER TABLE runs ADD CONSTRAINT runs_pkey PRIMARY KEY (id);`
    -   **Purpose:** Enforces uniqueness of the UUID. This is the core mechanism for the idempotency requirement.

2.  **Foreign Keys**
    -   `ALTER TABLE runs ADD CONSTRAINT runs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`
    -   **Purpose:** Ensures referential integrity.

3.  **Check Constraints**
    -   `CHECK (end_time > start_time)`: Ensures sanity of timestamps.
    -   `CHECK (distance >= 0)`: Prevents negative distances.
    -   `CHECK (duration >= 0)`: Prevents negative duration.

## Indices

1.  **User History (Most Critical)**
    -   `CREATE INDEX idx_runs_user_start_desc ON runs (user_id, start_time DESC);`
    -   **Purpose:** Optimized for "Get my run history", which will almost always filter by user and sort by date descending.

2.  **Overlap Detection (Anti-Gaming)**
    -   `CREATE INDEX idx_runs_user_time_range ON runs (user_id, start_time, end_time);`
    -   **Purpose:** Efficiently finding existing runs for a user that overlap with a new submission's time window.

3.  **Status/Reconciliation**
    -   `CREATE INDEX idx_runs_status_pending ON runs (status) WHERE status != 'synced';`
    -   **Purpose:** Partial index to quickly identify runs that need attention (flagged, overlapping, etc.) without indexing the millions of healthy 'synced' runs.

4.  **Raw Data Lookups**
    -   `CREATE INDEX idx_run_raw_data_run_id ON run_raw_data (run_id);`
    -   **Purpose:** Fast retrieval of raw GPS data for a specific run.
