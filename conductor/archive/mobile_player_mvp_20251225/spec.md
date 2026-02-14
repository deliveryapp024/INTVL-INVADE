# Track: Mobile App (Player-Facing MVP)

## Summary
Deliver the first player-facing, touchable MVP on device with visible progress daily:
1) run path polyline
2) H3 hex overlay (res 8)
3) owned zones highlight
4) loop bonus zones highlight (distinct)

## Non‑Negotiables (UI Contract)

### Map Rules
- Android: Google Maps
- iOS: Apple Maps
- No custom map styles yet

### Color Rules
- Owned by you: solid blue fill
- Owned by others: solid green fill
- Unowned: not rendered / transparent
- Loop bonus hex: yellow overlay (higher opacity)
- No gradients, no animations (visibility > beauty)

## Scope

### Phase 1 — Map Screen (First “It Works”)
Screen: `MapScreen.tsx`
- Shows map (platform default provider)
- Shows latest run polyline
- Shows owned hexes for current cycle
- Shows loop bonus hexes with different treatment

Backend contract assumptions (may be refined):
- `GET /api/runs/latest`
- `GET /api/zones/current`

Zone payload shape:
```json
{
  "h3_index": "string",
  "owner_user_id": "string|null",
  "is_loop_bonus": "boolean?"
}
```

Rendering strategy:
- Backend sends `h3_index` only
- Mobile converts to polygon using `h3-js` `cellToBoundary`
- Renders via `react-native-maps` `<Polygon />`

### Phase 2 — Run Recorder (Minimal)
- Collect: `lat`, `lng`, `timestamp`
- No pause detection, no smoothing
- Flow: Start → sample every X seconds → Stop → upload `raw_data` → finalize → navigate back to map

### Phase 3 — Ownership Feedback (Motivation Layer)
After finalize:
- Refetch zones
- Highlight newly owned hexes and loop bonus hexes
- Show a simple text: “You captured N zones this week”

### Phase 4 — Light Polish (Optional, only after working)
- Toggle: “Show my runs”
- Banner: “Week resets in X days”
- Zoom-to-fit owned zones

## Explicitly Out of Scope
- Leaderboards
- Friends / social feed
- Profile
- Animations
- Notifications

## Acceptance Criteria
- On iOS + Android device/emulator:
  - Map renders
  - Latest run polyline renders
  - Owned zones render with correct colors
  - Loop bonus hexes render distinctly
- Run recorder uploads and finalizes successfully, and map updates after finalize

