# Plan: Geospatial Mapping (H3 Path Extraction)

## Phase 0 — Decisions (Design Gate)
- [x] Decide MVP H3 resolution (document value + rationale) (H3_RESOLUTION_MVP=8)
- [x] Choose persistence model for `run_hexes` (Run field vs table vs join table) (join table w/ sequenceIndex)
- [x] Identify source of GPS samples for finalized runs (exact model/service boundary) (`RunRawData.rawData`)
- [x] Verification Gate: User confirms resolution + persistence choices

## Phase 1 — Test Harness (Red)
- [x] Add unit tests for GPS→H3 mapping at chosen resolution
- [x] Add unit tests for sequential dedupe preserving order
- [x] Add unit tests enforcing continuity (no introduced gaps between consecutive hexes)
- [x] Verification Gate: Tests fail for missing implementation

## Phase 2 — Implementation (Green)
- [x] Implement GPS→H3 conversion utility/service
- [x] Implement ordered sequential-dedupe of hex indices
- [x] Implement continuity checks (as needed to avoid introducing gaps)
- [x] Persist `run_hexes` for finalized runs using chosen model
- [x] Verification Gate: All new tests pass

## Phase 3 — Integration + Backfill (If Applicable)
- [x] Wire mapping into run finalization pipeline (post-finalization step)
- [x] Add idempotency (re-running finalization does not duplicate/fragment hexes)
- [x] Add migration/backfill strategy for already-finalized runs (if required)
- [x] Verification Gate: User validates on a real run sample in dev

## Phase 4 — Documentation + Handoff
- [x] Document resolution + persistence in relevant repo docs (and link here)
- [x] Add brief “out of scope” note to prevent ownership/scoring creep
- [x] Verification Gate: User confirms Track 3 is complete and ready for Track 4
