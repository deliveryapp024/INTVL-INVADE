# Track: Geospatial Mapping (H3 Path Extraction)

## Summary
Convert each **finalized run** into an ordered, unique set of traversed **H3 hex indices** (`run_hexes`) at a single MVP resolution. This creates the foundational “where” layer for gameplay (zones, territory ownership, weekly competition), without implementing any ownership/scoring logic yet.

This is the first gameplay-enabling track:
- Track 1/2 ensured run truth and integrity.
- Track 3 converts truth into spatial traversal.

## In Scope

### 1) GPS → H3 Conversion
For each GPS point (or segment) in a finalized run:
- Convert `(lat, lng)` → `h3Index` using the chosen H3 resolution.
- Deduplicate **sequential** duplicates (preserve order, remove immediate repeats).
- Output:
  - `run_hexes: string[]` (ordered, unique-by-adjacency)

Notes:
- “Unique” here means “no adjacent repeats”, not globally unique.
- Preserve order because future mechanics (loops/enclosures) depend on the path sequence.

**GPS Source (MVP):** `RunRawData.rawData` (JSON array of `{ lat, lng, time }`), read during/after finalization.

### 2) Path Continuity
Ensure:
- Adjacent-hex continuity is preserved in the output sequence.
- No “teleport gaps” are introduced by conversion/deduplication.

Assumption:
- Teleport/gap detection is handled by Track 2; this track must not reintroduce discontinuities.

### 3) Persistence Model (Design + Implementation)
Decide and implement where `run_hexes` live. Options:
1. `run_hexes` table (one row per run) with array/JSON column.
2. Embedded array/JSON field on `Run`.
3. Join table `run_id ↔ h3_index` (optionally with `sequence_index` to preserve order).

Requirements for the chosen approach:
- Preserves order.
- Is queryable for future “zone”/“territory” features.
- Is practical for MVP scale and mobile latency constraints.

**MVP Decision:** Join table with sequence (preserve order + queryable)
- Table concept: `RunHex`
  - `runId` (FK to `Run`)
  - `sequenceIndex` (int, 0..n-1)
  - `h3Index` (string)
- Indexes:
  - `(runId, sequenceIndex)` unique
  - `(h3Index)` for later zone queries/aggregation

### 4) MVP Resolution Decision
Choose **one fixed H3 resolution** for MVP.

Tradeoffs:
- Too coarse: boring gameplay, low spatial differentiation.
- Too fine: noisy, expensive storage/querying, jitter sensitivity.

Decision output:
- `H3_RESOLUTION_MVP` documented (and centralized in code/config).

**MVP Decision:** `H3_RESOLUTION_MVP = 8`

Rationale:
- Matches existing geo design notes (zones at H3 Res 8, with aggregation to Res 7 later).
- Balances meaningful neighborhood-scale differentiation with manageable storage and jitter tolerance for GPS sampling.

## Explicitly Out of Scope (Track 3)
Do not implement:
- Ownership rules
- Weekly resets
- Zone scoring
- Loop bonuses / enclosure detection

Track 3 answers “where”, not “who owns”.

## Acceptance Criteria
- Given a finalized run with GPS samples, the system produces `run_hexes: string[]`:
  - Ordered according to traversal
  - No sequential duplicates
  - No continuity break introduced by mapping logic
- The chosen persistence model stores and retrieves `run_hexes` correctly for a run.
- H3 resolution is fixed for MVP and documented + used consistently.
- Unit tests cover:
  - Point→H3 conversion at the chosen resolution
  - Sequential dedupe behavior
  - Continuity/adjacency constraints on the produced sequence
- No ownership/scoring logic exists in code paths added by this track.

## Implementation Notes (Repo)
- Mapping utility: `backend/src/features/runs/run-hexes.ts` (H3 Res 8, continuity via `gridPathCells`)
- Persistence helper: `backend/src/features/runs/run-hexes.persistence.ts` (replace-by-runId for idempotency)
- Finalization integration: `backend/src/features/runs/runs.controller.ts` (stores hexes only when FINALIZED)
- Prisma schema: `backend/prisma/schema.prisma` (model `RunHex`)
- Migration SQL: `backend/prisma/migrations/20251225174030_add_run_hexes/migration.sql`
- Optional backfill: `backend/src/scripts/backfill-run-hexes.ts` via `npm run backfill:run-hexes` (backend)
