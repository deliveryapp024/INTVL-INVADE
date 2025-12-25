# 01. Geometric & Technical Foundation

## H3 Resolution Strategy

### Primary Zone Resolution: **Resolution 8**
- **Average Area:** ~0.73 km²
- **Average Edge Length:** ~461 meters
- **Rationale:**
    - **Scale:** Fits well with the typical 5k run (users traverse multiple hexes but can "own" a specific one).
    - **Urban Context:** Roughly maps to a large neighborhood or a cluster of residential blocks in Indian cities (e.g., a "Sector" in Noida or a "Layout" in Bangalore).
    - **Rural Context:** Large enough to be meaningful in less dense areas without being impossible to traverse.

### Secondary/Analysis Resolutions (Internal Use)
- **Resolution 7:** Aggregation for "City Districts" or "Wards".
- **Resolution 9:** Finer granularity for "Hotspots" or high-density contention areas (future feature).

## Coordinate Mapping Logic

### Coordinate System
- **Input:** GPS Coordinates (Latitude, Longitude) WGS84.
- **Library:** `h3-js` (Node.js) / `uber-h3` bindings.

### Indexing Strategy
1.  **Ingestion:** When a run is uploaded, map every GPS point to its corresponding H3 index at **Res 8**.
2.  **Deduplication:** Store the set of unique H3 indices touched by the run.
3.  **Storage:** Store H3 indices as 64-bit integers (or hex strings) in the database for efficient indexing.
    - **PostgreSQL:** Use `h3-pg` extension or store as `bigint`.
