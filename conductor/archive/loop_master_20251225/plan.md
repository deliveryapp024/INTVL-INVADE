# Plan: Loop Master (Enclosures & High-Skill Play)

## Phase 0 — Decisions (Design Gate)
- [x] Confirm `MIN_LOOP_LENGTH` (5)
- [x] Confirm `BONUS_METERS_PER_HEX` default + tuning range (default 75m, 50–100m)
- [x] Confirm “max 1 loop per run” constraint (enforced)
- [x] Verification Gate: User confirms Phase 0 decisions

## Phase 1 — Tests (Red)
- [x] Tests for detecting loop candidates from ordered `run_hexes`
- [x] Tests for rejecting trivial backtracks/jitter loops
- [x] Tests for enclosed-hex computation from a boundary path
- [x] Verification Gate: Tests fail pre-implementation

## Phase 2 — Core Logic (Green)
- [x] Implement loop detection (first valid loop, min length, guardrails)
- [x] Implement enclosure computation (hex-based polygon fill)
- [x] Persist `run_loops` for runs with a detected loop
- [x] Verification Gate: All tests pass

## Phase 3 — Integration with Zones (Additive)
- [x] Write loop bonus contributions into `run_zone_contributions` with `source="LOOP_BONUS"`
- [x] Ensure idempotency (re-finalization does not double-apply bonuses)
- [x] Verify ownership recomputation includes bonuses
- [x] Verification Gate: Sample data validated

## Phase 4 — Safeguards & Tuning
- [x] Add feature flag for Loop Master (on/off)
- [x] Add config for bonus magnitude and min loop length
- [x] Verification Gate: Loop Master can be disabled without side effects

## Phase 5 — Documentation + Handoff
- [x] Document Loop Master rules, constants, and constraints
- [x] Explicit out-of-scope notes (multi-loop, nesting, rendering)
- [x] Verification Gate: User confirms Track 5 complete
