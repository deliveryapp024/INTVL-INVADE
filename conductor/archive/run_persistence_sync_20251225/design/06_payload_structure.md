# JSON Payload Structure: Run Submission

## Schema Definition (JSON Schema Style)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RunSubmission",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique client-generated ID for idempotency."
    },
    "start_time": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of when the run started."
    },
    "end_time": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of when the run ended."
    },
    "duration": {
      "type": "integer",
      "minimum": 0,
      "description": "Total elapsed time in seconds."
    },
    "distance": {
      "type": "number",
      "minimum": 0,
      "description": "Total distance covered in meters."
    },
    "activity_type": {
      "type": "string",
      "enum": ["RUN", "WALK", "HIKE", "CYCLE"],
      "default": "RUN"
    },
    "polyline": {
      "type": "string",
      "description": "Encoded polyline string representing the simplified path."
    },
    "raw_data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "lat": { "type": "number", "minimum": -90, "maximum": 90 },
          "lng": { "type": "number", "minimum": -180, "maximum": 180 },
          "time": { "type": "string", "format": "date-time" },
          "ele": { "type": "number" },
          "acc": { "type": "number", "minimum": 0 },
          "spd": { "type": "number", "minimum": 0 }
        },
        "required": ["lat", "lng", "time"]
      },
      "description": "Array of high-fidelity GPS points."
    },
    "metadata": {
      "type": "object",
      "additionalProperties": true,
      "description": "Arbitrary key-value pairs for device/app context."
    }
  },
  "required": ["id", "start_time", "end_time", "duration", "distance", "activity_type", "polyline", "raw_data"]
}
```

## Validation Rules
1.  **Idempotency:** `id` must be unique across all runs for all users (global unique constraint).
2.  **Temporal Sanity:** `end_time` must be strictly after `start_time`. `duration` should approximately match `end_time - start_time`.
3.  **Spatial Consistency:** `distance` should be reasonably consistent with the `raw_data` points.
4.  **Data Quality:** `raw_data` should not be empty.
