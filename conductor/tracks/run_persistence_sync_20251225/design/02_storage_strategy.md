# Storage Strategy: GPS Coordinates

## Strategy Overview
We are adopting a **Hybrid Geospatial Storage** strategy to balance read performance for common use cases (lists, maps) against the storage cost and retrieval overhead of high-fidelity data.

## 1. Simplified Polyline (Hot Storage)
- **Location:** `runs` table, `polyline` column.
- **Format:** Google Encoded Polyline Algorithm Format.
- **Purpose:**
    - Rapid visualization on map thumbnails (History View).
    - Quick rendering of route overlays without fetching full datasets.
- **Precision:** Reduced precision (e.g., 5 decimal places, simplified geometry) to keep string size small (< 10KB usually).

## 2. Raw GPS Data (Cold/Warm Storage)
- **Location:** Dedicated `run_raw_data` table (MVP) -> Object Storage (Future).
- **Format:** JSONB or Compressed Binary.
- **Purpose:**
    - Detailed analytics (pace zones, elevation gain).
    - Anti-cheat analysis.
    - Export functionality (GPX/TCX).
- **Schema:**

```sql
CREATE TABLE run_raw_data (
    run_id UUID PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
    
    -- Storing as JSONB for flexibility and compression in Postgres
    -- Structure: Array of { lat, lng, time, ele, acc, speed }
    -- Alternative: Use a specialized binary format if size becomes an issue.
    raw_data JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trade-off Analysis
- **Why Separate Table?**
    - Keeps the primary `runs` table light. Scanning `runs` for history lists won't load megabytes of JSON data per row.
    - Allows for different backup/retention policies in the future.
- **Why Postgres JSONB vs S3 (Initial)?**
    - **Simplicity:** Transactional consistency with the `runs` record. No need to manage S3 upload flows, presigned URLs, or consistency checks during the MVP phase.
    - **Queryability:** JSONB allows us to query inside the data if needed (e.g., "find runs with elevation > X") without downloading the file.
- **Migration Path:**
    - When data grows, we can move `raw_data` content to S3 and replace the column content with an S3 URL, or just change the application logic to look at S3.

## Recommendation for MVP
Implement the `run_raw_data` table with a `JSONB` column. This fulfills the "dedicated storage structure" requirement while minimizing infrastructure complexity.
