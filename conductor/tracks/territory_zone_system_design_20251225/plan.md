# Implementation Plan: Territory / Zone System (Design-Only)

#### Phase 1: Geometric & Technical Foundation [checkpoint: 930b8ac]
- [x] Task: Define specific H3 resolution levels for the Indian market (Urban vs. Rural). <!-- id: geometry_doc -->
- [x] Task: Document the coordinate-to-H3 mapping logic and indexing strategy. <!-- id: geometry_doc -->
- [x] Task: Conductor - User Manual Verification 'Phase 1: Geometric & Technical Foundation' (Protocol in workflow.md) <!-- id: 930b8ac -->

#### Phase 2: Capture & Ownership Blueprint
- [ ] Task: Create detailed pseudo-code for the "Competitive Control" aggregation logic.
- [ ] Task: Document the "Defending Champion" soft-reset state transition.
- [ ] Task: Refine the tie-breaker logic for multi-user contention.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Capture & Ownership Blueprint' (Protocol in workflow.md)

#### Phase 3: Loop Geometry & Algorithms
- [ ] Task: Define geometric criteria for "Enclosure" (Point-in-polygon vs. Enclosed-Hexes).
- [ ] Task: Establish numeric thresholds for loop proximity and area validity.
- [ ] Task: Define maximum computational complexity limits for loop detection to ensure mobile and backend feasibility.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Loop Geometry & Algorithms' (Protocol in workflow.md)

#### Phase 4: Safeguards & UX Logic
- [ ] Task: Define explicit speed/acceleration constants for anti-gaming.
- [ ] Task: Map out the user feedback loop for successful vs. failed (near-miss) captures.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Safeguards & UX Logic' (Protocol in workflow.md)

#### Phase 5: Visualization & Leaderboard Hierarchy
- [ ] Task: Design the leaderboard data flow (Zone activity -> Ward leaderboards -> City rankings).
- [ ] Task: Define the UI overlay rules (Z-index, transparency, owner colors).
- [ ] Task: Define visual state for contested zones (no clear owner).
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Visualization & Leaderboard Hierarchy' (Protocol in workflow.md)
