# Track 4: Territory Zones (Deterministic, Resettable Ownership)

## Summary
Introduce a deterministic, resettable zone ownership system based on H3 hexes (MVP resolution = 8). By the end of this track, every hex is either unowned or owned by a user for a given time cycle, and ownership is earned via distance contribution within that cycle.

Track 4 answers: “who owns what (this week)?”

## In Scope

### 1) Zone Definition
- A **Zone** = one H3 hex at MVP resolution.
- `zone_id = h3_index` (string).
- Zones are independent (no clustering/regions yet).

### 2) Contribution Model (Core Rule)
For each finalized run:
- For every `h3_index` in `run_hexes`, attribute **distance contribution** to that hex for the run’s user within the active cycle.

Example:
- User A ran 120m in hex X
- User B ran 90m in hex X
- → User A owns hex X (for that cycle)

Properties:
- Simple, deterministic, auditable, hard to game (given integrity + hex path from Tracks 2/3).

### 3) Ownership Resolution
Rules:
- Ownership is decided per cycle.
- Winner per zone is the user with the highest **total distance** in that zone within the cycle.
- Ties: deterministic tie-breaker (MVP):
  1) earliest `firstAt` (earliest segment timestamp contributing to that zone in the cycle), then
  2) lowest `userId` (stable tie-break).

### 4) Time Windows / Cycles
Introduce cycles (MVP):
- Weekly: Monday 00:00 UTC → Sunday 23:59:59 UTC.

Ownership:
- Valid only within its cycle.
- Recomputed or rolled over each cycle (no permanent lock-in).

**MVP Cycle Key:** `cycleKey = <UTC Monday YYYY-MM-DD>` (start of the weekly window).

### 5) Persistence Model
Add backend persistence for:
- `zone_contributions` (auditable per user/zone/cycle)
- `zone_ownerships` (derived, per zone/cycle)

Separated so that:
- Ownership can be recomputed.
- Contributions remain auditable.

## Explicitly Out of Scope (Track 4)
- Loop bonuses / enclosures
- Global leaderboards
- Social feeds
- Map rendering polish

## Acceptance Criteria
- Given finalized runs with `run_hexes`, the backend records per-zone distance contributions per user per cycle.
- Ownership for a cycle can be computed deterministically from contributions.
- Each zone has at most one owner per cycle (or is unowned).
- Weekly cycle boundaries are handled correctly (UTC).
- Tie-breaking is deterministic and documented + tested.
- Unit/integration tests cover:
  - Cycle calculation
  - Contribution accumulation
  - Ownership resolution + tie-break
  - Reset behavior across cycles (new cycle yields new ownerships)

## Implementation Notes (Repo)
- Cycle window utility: `backend/src/features/zones/zone-cycle.ts`
- Per-run contributions from GPS/H3: `backend/src/features/zones/zone-contributions.ts`
- Deterministic ownership resolution: `backend/src/features/zones/zone-ownership.ts`
- Persistence helpers: `backend/src/features/zones/zone.persistence.ts`
- Finalization integration: `backend/src/features/runs/runs.controller.ts` (writes `run_zone_contributions`, recomputes owners for touched hexes)
- Prisma models: `backend/prisma/schema.prisma` (`RunZoneContribution`, `ZoneOwnership`)
- Migration SQL: `backend/prisma/migrations/20251225175930_add_zone_ownership/migration.sql`
- API (minimal):
  - `GET /api/zones/owned?userId=...&at=...`
  - `GET /api/zones/ownerships/current?h3Indices=...&at=...`
- Scripts:
  - `npm run backfill:zone-contributions` (populate per-run contributions for existing finalized runs)
  - `npm run recompute:zone-ownerships` (recompute ownerships for a cycle; set `CYCLE_AT=...` to target a week)
