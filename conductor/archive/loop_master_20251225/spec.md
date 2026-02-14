# Track 5: Loop Master (Enclosures & High-Skill Play)

## Core Idea
Reward skillful route design by detecting **closed loops (enclosures)** in a run’s ordered `run_hexes` path and granting **bonus zone contributions** for the **hexes enclosed** by that loop (not the boundary).

Track 5 answers: “Did this run enclose territory in a skillful way?”

## Design Principles (Non-Negotiable)
- **Skill > Distance:** loop rewards intentional route planning, not kilometer grinding.
- **Deterministic, Server-Side:** same input → same loop detection; no device-specific heuristics.
- **Additive, Not Replacing Track 4:** distance ownership still matters; loops add bonus influence.
- **Explicit Scope Control:** MVP supports **max 1 loop per run**; nested/overlapping loops are out of scope.

## In Scope

### 1) Loop Definition (MVP)
A loop candidate is detected when:
- The ordered `run_hexes` path revisits a previously visited hex `H`.

Formally:
- If hex `H` appears at indices `i` and `j` (`j > i`), and `(j - i) >= MIN_LOOP_LENGTH`,
- then path segment `run_hexes[i..j]` forms a loop candidate.

MVP constant:
- `MIN_LOOP_LENGTH = 5` (configurable)

### 2) Loop Geometry (Enclosure)
For a valid loop:
- Treat the loop path as a boundary in hex space.
- Compute the set of **interior (enclosed) hexes**.

Output:
- `enclosed_hexes: string[]`

Notes:
- Boundary hexes are already credited via distance contributions (Track 4).
- Loop Master rewards interior hexes only.

### 3) Bonus Capture Rule (MVP)
For each enclosed hex:
- Apply a “Loop Bonus Contribution” for the run’s user in the **current cycle**.

MVP rule:
- Each enclosed hex counts as `+BONUS_METERS_PER_HEX` meters of contribution.
- `BONUS_METERS_PER_HEX` is configurable (default 75m; tuning range 50–100m).

This preserves Track 4 ownership and avoids instant “map nukes”.

### 4) Persistence Model
Add:
- `run_loops` (optional per run)
  - `run_id`
  - `cycle_key`
  - `loop_start_index`
  - `loop_end_index`
  - `boundary_hexes[]` (optional, for audit/debug)
  - `enclosed_hexes[]`
- `run_zone_contributions` (already exists)
  - write loop bonuses into this table with a `source = "LOOP_BONUS"` flag

Separation ensures:
- bonuses are auditable
- ownerships are recomputable

### 5) Constraints (Explicit MVP Limits)
MVP enforces:
- Max 1 loop per run
- No nested loops
- No overlapping loop bonuses
- Loop must be fully within one cycle

## Explicitly Out of Scope (Track 5)
- Multiple loops per run
- Nested enclosures
- Loop-vs-loop conflicts
- Visual polygon rendering
- Real-time loop detection
- Competitive loop stealing

## Acceptance Criteria
Given a finalized run with `run_hexes`, the system:
- Detects a valid loop (or none)
- Computes enclosed hexes deterministically
- Writes loop bonus contributions into `run_zone_contributions` with `source = "LOOP_BONUS"` and attributable `run_id`
- Ownership resolution (Track 4) naturally incorporates loop bonuses
- Unit tests cover:
  - loop detection
  - false positives (backtracking/jitter)
  - enclosed-hex computation
  - bonus contribution application + idempotency

## Implementation Notes (Repo)
- Loop detection + enclosure:
  - `backend/src/features/loops/loop-master.ts`
  - `backend/src/features/loops/loop-master.test.ts`
- Config/flags:
  - `backend/src/features/loops/loop-master.config.ts` (`LOOP_MASTER_ENABLED`, `MIN_LOOP_LENGTH`, `BONUS_METERS_PER_HEX`)
- Persistence:
  - `backend/prisma/schema.prisma` (`RunLoop`, `RunZoneContribution.source`)
  - `backend/prisma/migrations/20251225182530_add_loop_master/migration.sql`
  - `backend/src/features/loops/loop.persistence.ts` (`upsertRunLoop`)
- Integration point:
  - `backend/src/features/runs/runs.controller.ts` (writes `run_loops`, writes `LOOP_BONUS` contributions, ownership incorporates bonuses)
