# Run Lifecycle & Status Fields

## Mobile-Side Lifecycle
The mobile app maintains its own state for each run to manage offline-first synchronization.

| Status | Description | Transition Triggers |
| :--- | :--- | :--- |
| **`local_only`** | Run is saved locally but not yet acknowledged by the backend. | Initial state after run completion. |
| **`syncing`** | A sync request is currently in progress. | Sync service picks up the run. |
| **`synced`** | Run has been successfully persisted to the backend. | 200/201 response from API. |
| **`failed`** | The last sync attempt failed due to network or server error (5xx). Retriable. | Network timeout, 500 error. |
| **`rejected`** | The backend rejected the run (4xx). Non-retriable without user intervention. | 400 Bad Request, 422 Unprocessable Entity. |

### Sync State Machine
1.  **Creation:** `Run` created -> `local_only` (added to sync queue).
2.  **Attempt:** `local_only` / `failed` -> `syncing`.
3.  **Success:** `syncing` -> `synced` (remove from queue, keep in history).
4.  **Retry:** `syncing` -> `failed` (wait for backoff/trigger).
5.  **Failure:** `syncing` -> `rejected` (remove from queue, show error).

## Backend-Side Lifecycle (`runs.status`)
The backend `status` field reflects the validity and competitive standing of the run.

| Status | Description | Competitive Logic |
| :--- | :--- | :--- |
| **`synced`** | Standard, valid run. | **Included** in leaderboards/zones. |
| **`overlapping`** | Run overlaps in time with another run for the same user. | **Excluded** by default. |
| **`flagged`** | Marked for review by anti-gaming heuristics or admin. | **Excluded**. |

### Logic
- **Insertion:**
    - If `overlaps(new_run, existing_runs)` -> set `status = 'overlapping'`.
    - Else -> set `status = 'synced'`.
- **Updates:**
    - Admin or System can update `status` to `flagged` or back to `synced`.
