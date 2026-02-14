# Plan: Mobile App (Player-Facing MVP)

## Phase 0 — Lock UI Contract
- [x] Confirm map providers (Google Android / Apple iOS)
- [x] Confirm color rules (blue/green/transparent + yellow loop overlay)
- [x] Verify backend endpoints to use (or add minimal ones) (`GET /api/runs/latest`, `GET /api/zones/current`)
- [x] Verification Gate: User confirms Phase 0

## Phase 1 — Map Screen “It Works”
- [x] Add `MapScreen.tsx` with `react-native-maps`
- [x] Fetch and render latest run polyline
- [x] Fetch zones for current cycle and render H3 polygons
- [ ] Verification Gate: User sees polyline + hexes on phone

## Phase 2 — Run Recorder (Minimal)
- [x] Add start/stop run recorder (GPS sampling every X seconds)
- [x] Upload `raw_data` and call finalize
- [x] Navigate back and refetch map data
- [x] Verification Gate: User records a run and sees map update

## Phase 3 — Ownership Feedback
- [x] Highlight newly owned zones and loop bonus zones
- [x] Add “You captured N zones this week” text
- [x] Verification Gate: User sees capture feedback after finalize

## Phase 4 — Light Polish (Optional)
- [x] Toggle “Show my runs”
- [x] Banner “Week resets in X days”
- [x] Zoom-to-fit owned zones
- [x] Verification Gate: User confirms polish is helpful and stable
