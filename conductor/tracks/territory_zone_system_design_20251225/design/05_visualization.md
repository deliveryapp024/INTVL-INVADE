# 05. Visualization & Leaderboard Hierarchy

## Leaderboard Data Flow

### 1. Level 1: Zone (H3 Res 8)
- **Metric:** Total distance in the current cycle per user.
- **Winner:** "Zone King/Queen" - User with the max distance.
- **Real-time:** Updates immediately after activity processing.

### 2. Level 2: District / Ward (H3 Res 7)
- **Metric:** Total zones owned within the district.
- **Winner:** "District Champion" - User owning the most Res 8 zones inside this Res 7 boundary.
- **Aggregation:** Calculated by querying all owned zones and grouping by parent H3 index (Res 7).

### 3. Level 3: City / Global
- **Metric 1: Total Territory:** Sum of areas of all unique zones owned.
- **Metric 2: Dominance:** Percentage of the city's active zones owned by a single user or club.
- **Winner:** "City Overlord".

## UI Overlay Rules

### 1. Zone Appearance
- **Owned Zones:** Filled with the owner's primary color (70% opacity). Displays owner's avatar at the hex center.
- **Unclaimed Zones:** Thin gray outline, no fill.
- **Contested Zones (New Activity detected):** Pulsing border or "Hot" icon if activity > 50% of owner's score.
- **Defending Champion State:** Faded color (30% opacity) with a "Crown" icon until recaptured.

### 2. Z-Index & Layers
- **Bottom:** Base Map (Minimalist Style).
- **Middle:** Route Polylines (High Contrast).
- **Top:** Zone Hexagons (Semi-transparent).
- **Overlay:** Avatars and Icons.

### 3. Visual State: Contested (No Clear Owner)
- **Status:** Occurs during the initial minutes of a cycle or when two users are within a negligible margin (e.g., < 10m).
- **Visual:** Alternating colors (striped) or a neutral "Battle" icon (clashing swords) until a clear leader emerges.
