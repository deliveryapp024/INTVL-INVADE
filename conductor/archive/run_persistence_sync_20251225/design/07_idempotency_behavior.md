# Idempotent Response Behavior

## Problem Definition
Network instability on mobile often leads to retries. If a client submits a run, the server persists it, but the response is lost, the client will retry the same payload. The server must handle this without creating duplicates or returning errors that confuse the client.

## Logic Flow

1.  **Receive Request:** `POST /api/runs` with `body.id`.
2.  **Check Existence:** `SELECT * FROM runs WHERE id = body.id;`
3.  **Handle Duplicate:**
    - If a record is found:
        - **Security Check:** Verify that `record.user_id` equals the `current_user.id`.
        - If **User Match**:
            - Return `200 OK`.
            - Body:
                ```json
                {
                  "status": "success",
                  "message": "Run already processed",
                  "data": {
                    "id": "...",
                    "run_status": "synced",
                    "received_at": "original_timestamp"
                  }
                }
                ```
        - If **User Mismatch**:
            - Return `409 Conflict` or `403 Forbidden`.
            - *Rationale: Prevent users from guessing or accidentally reusing IDs belonging to others.*
4.  **Handle New:**
    - If no record found: Proceed to validation -> insertion -> `201 Created`.

## Key Benefits
- **Client Resilience:** The mobile app can safely retry any "Pending" run until it receives a 200/201 or a permanent 4xx.
- **Data Integrity:** Database primary key constraint on `id` acts as the final guard against race conditions.
- **Transparency:** Returning the existing status allows the client to know if the previously submitted run was flagged or overlapping.
