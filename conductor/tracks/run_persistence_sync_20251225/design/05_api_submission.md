# API Contract: Run Submission

## Endpoint Overview
- **Path:** `/api/runs`
- **Method:** `POST`
- **Authentication:** Required (JWT Bearer Token)
- **Content-Type:** `application/json`

## Purpose
Ingest a completed activity (run) from the mobile application. This endpoint is designed to be idempotent and handle high-fidelity GPS data alongside simplified polylines.

## Request Specification

### Headers
| Header | Value | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `Bearer <token>` | Yes | User authentication token. |
| `Content-Type` | `application/json` | Yes | |

### Request Body
The request body contains the run metadata and path data.

```json
{
  "id": "uuid-v4-generated-by-client",
  "start_time": "2025-12-25T10:00:00Z",
  "end_time": "2025-12-25T10:30:00Z",
  "duration": 1800,
  "distance": 5000.5,
  "activity_type": "RUN",
  "polyline": "encoded_polyline_string...",
  "raw_data": [
    {
      "lat": 12.9716,
      "lng": 77.5946,
      "time": "2025-12-25T10:00:01Z",
      "ele": 920.5,
      "acc": 5.0,
      "spd": 2.5
    },
    ...
  ],
  "metadata": {
    "device_model": "iPhone 13",
    "os_version": "iOS 17.2",
    "app_version": "1.0.4"
  }
}
```

## Response Specification

### 201 Created (Initial Success)
Returned when the run is successfully received and persisted for the first time.
```json
{
  "status": "success",
  "data": {
    "id": "uuid-v4-generated-by-client",
    "run_status": "synced",
    "received_at": "2025-12-25T10:35:00Z"
  }
}
```

### 200 OK (Duplicate/Idempotent Success)
Returned when the `id` has already been processed. No changes are made to the database.
```json
{
  "status": "success",
  "message": "Run already processed",
  "data": {
    "id": "uuid-v4-generated-by-client",
    "run_status": "synced",
    "received_at": "2025-12-25T10:35:00Z"
  }
}
```

### 400 Bad Request
Returned if the payload is malformed or fails basic validation.
```json
{
  "status": "error",
  "code": "VALIDATION_FAILED",
  "message": "Invalid distance: cannot be negative",
  "details": { ... }
}
```

### 401 Unauthorized
Returned if the authentication token is missing or invalid.

### 409 Conflict (Business Logic Failure)
*Reserved for future use if we want to distinguish between technical errors and business rule violations.*
Currently, overlapping runs return **201 Created** with a specific flag in the data (see next task).
