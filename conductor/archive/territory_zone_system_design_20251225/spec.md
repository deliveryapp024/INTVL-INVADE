# Specification: Territory / Zone System (Design-Only)

## Overview
Define the logic, geometry, and rules for the territory capture system ("Zones"). This system is the core gamification layer where users compete for ownership of real-world areas based on their running activity. This spec serves as the blueprint for future backend and frontend implementation.

## 1. Zone Geometry
- **Strategy:** Hexagonal Grid (H3).
- **Rationale:** Uniform size, consistent adjacency for gameplay, scalable computation, and fair area representation compared to rectangular grids.

## 2. Capture Conditions
To capture or contest a zone, a run must meet the following criteria:
- **Eligibility:** The user must run a minimum distance *within* the specific zone boundary (e.g., > 0.5km inside the hex).
- **Ownership Rule:** **Competitive Control**. Ownership is awarded to the user with the highest accumulated activity (distance/effort) within that zone during the current cycle.
- **Aggregation:** Multiple runs by the same user in the same cycle stack their total activity for that zone.
- **Scoring Basis:** Activity aggregation is based on distance by default; alternative effort metrics (time, points) may be introduced later.
- **Effort Scope:** Only activity recorded as running (not walking or cycling) is eligible for zone capture.
- **Tie-Breaker (Design-Level):** In case of equal scores, the zone remains contested or favors the previous owner until surpassed.

## 3. Advanced Mechanic: Closed-Loop Capture (MVP)
A high-skill, optional mechanic rewarding deliberate route planning.
- **Definition:** A run qualifies if:
    1.  **Proximity:** Ends within a short distance of the start point (allowing for GPS noise).
    2.  **Enclosure:** The route path visually encloses a meaningful area.
    3.  **Validity:** Meets minimum total distance/duration; naturally formed (not jitter).
- **Effect:**
    - Upon valid detection, the run effectively "interacts" with all eligible zones *fully enclosed* by the loop polygon.
    - **Interaction Clarity:** Only zones that are fully enclosed by the loop polygon and meet eligibility criteria are affected.
    - Enclosed zones count toward ownership calculations for the current cycle.
    - Triggers a "Closed-Loop Badge" or visual celebration.
- **Constraints:** Does not bypass anti-gaming or competitive control rules.

## 4. Ownership Cycle & Reset
- **Model:** Cyclical Ownership (Weekly).
- **Cadence:** Zones reset every week (e.g., Sunday midnight).
- **Persistence:** Ownership persists throughout the week until a competitor surpasses the user's score.
- **Reset Logic:**
    - Hard Reset option: All ownerships cleared.
    - Soft Reset option (Preferred): Ownership status clears, but previous owners might retain "Defending Champion" status or visual history until new activity occurs.
    - **Admin Configurable:** The reset cadence and type must be adjustable by system admins.

## 5. Anti-Gaming Rules
To ensure fair play and data integrity:
- **Speed Limits:** Discard data points or entire activities that exceed human running speeds (e.g., > 25km/h) or exhibit impossible acceleration.
- **Minimum Thresholds:** Reject activities that do not meet a minimum total distance (e.g., < 0.5km) or duration (e.g., < 5 mins) to prevent "living room GPS drift" captures.

## 6. Visualization & Leaderboards (Blueprint)
- **Map:** Zones appear as H3 overlays. Owned zones display the owner's color/avatar.
- **Leaderboards:**
    - **Zone Level:** "King of the Hill" list for each specific zone.
    - **Global/City Level:** Total zones owned, Total area controlled.

## Out of Scope (For Implementation Phase)
- Actual code implementation of H3 libraries.
- Database schema migrations.
- Frontend rendering components.
- (This track is purely for defining the *rules* and *logic*).
