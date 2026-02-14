# Plan: Territory Zones (Deterministic, Resettable Ownership)

## Phase 0 — Decisions (Design Gate)
- [x] Confirm cycle definition (weekly, UTC boundaries) + tie-breaker rule (weekly UTC, tie: firstAt then userId)
- [x] Finalize DB schema for contributions + ownerships (run_zone_contributions, zone_ownerships)
- [x] Verification Gate: User confirms Phase 0 decisions

## Phase 1 — Tests (Red)
- [x] Add tests for weekly cycle window computation
- [x] Add tests for contribution attribution per run_hex
- [x] Add tests for ownership resolution + deterministic tie-breaker
- [x] Verification Gate: Tests fail for missing implementation

## Phase 2 — Schema + Core Logic (Green)
- [x] Add Prisma models + migration: `zone_contributions`, `zone_ownerships`
- [x] Implement cycle utility (compute cycle key/start/end from timestamp)
- [x] Implement contribution writer on run finalization (or post-finalization job)
- [x] Implement ownership computation for a cycle (materialize `zone_ownerships`)
- [x] Verification Gate: All tests pass

## Phase 3 — Reset / Recompute Workflow
- [x] Add an idempotent “recompute ownerships for cycle” function/script
- [x] Add weekly reset mechanism (cron/job placeholder + manual trigger for MVP)
- [x] Verification Gate: User validates on sample data

## Phase 4 — API Surface (Minimal)
- [x] Add endpoint(s) to fetch ownerships for current cycle (by bbox later; MVP by user or list)
- [x] Add endpoint to fetch a user’s owned zones for the cycle
- [x] Verification Gate: User validates with Postman/curl

## Phase 5 — Documentation + Handoff
- [x] Document schema + cycle rules + tie-breaker
- [x] Explicit out-of-scope note (loops/leaderboards)
- [x] Verification Gate: User confirms Track 4 complete and ready for Track 5
