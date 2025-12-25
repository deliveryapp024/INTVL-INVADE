# API Contract: Overlapping Run Logic

## Logic Overview
To prevent unfair competitive advantage (e.g., running with two devices simultaneously), the system detects temporal overlaps between a user's activities.

## Detection Algorithm
A new run `N` overlaps with an existing run `E` for the same `user_id` if:
`N.start_time < E.end_time AND N.end_time > E.start_time`

## API Response Behavior
When an overlap is detected during submission:

1.  **Response Code:** `201 Created` (The data is successfully persisted).
2.  **Response Body:**
    ```json
    {
      "status": "success",
      "data": {
        "id": "...",
        "run_status": "overlapping",
        "warnings": ["Run overlaps with an existing activity and is excluded from competitive goals."]
      }
    }
    ```

## Database State
- The `status` column in the `runs` table is set to `'overlapping'`.
- This status is returned in subsequent `GET /api/runs` (History) calls.

## Competitive Impact
- **Zones/Leaderboards:** Queries for these features MUST filter for `status = 'synced'`.
- **Personal Totals:** Overlapping runs may be included or excluded depending on the specific view (e.g., "Total Training Distance" vs. "Competition Distance"). Default is exclusion from competition.

## Why this approach?
- **Data Preservation:** We never want the user to feel they "lost" a run because of a technicality or a test.
- **Anti-Gaming:** By flagging rather than rejecting, we maintain a record of the behavior without blocking the user's workflow.
