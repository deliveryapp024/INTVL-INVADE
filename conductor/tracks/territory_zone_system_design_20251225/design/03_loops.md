# 03. Loop Geometry & Algorithms

## Enclosure Criteria

### Strategy: **H3 Polygon-to-Cells (Polyfill)**
- **Algorithm:** Use the `h3.polygonToCells(coordinates, resolution)` function.
- **Criteria:** A zone (Res 8 hex) is considered "captured" by a loop if its center point is contained within the polygon defined by the GPS points of a valid closed-loop run.
- **Rationale:** 
    - Native to the H3 library.
    - Mathematically consistent with the zone definition.
    - Avoids expensive custom ray-casting implementations.

## Detection Logic & Numeric Thresholds

### 1. Loop Closure Proximity
- **Threshold:** End location must be within **50 meters** of the start location.
- **Buffer:** GPS noise tolerance allows for a small gap; the system "snaps" the end to the start to form a closed polygon.

### 2. Area Validity
- **Minimum Enclosed Area:** The loop must enclose at least **1 full Res 8 hex** (approx. 0.73 km²) or a defined minimum area (e.g., 0.1 km²) to prevent "micro-loops".
- **Self-Intersection:** Simple polygons only. Complex self-intersecting loops (figure-8) are treated as multiple polygons or rejected depending on complexity.

### 3. Minimum Effort
- **Minimum Run Distance:** 1.0 km.
- **Minimum Duration:** 5 minutes.

## Computational Complexity Limits
To ensure mobile and backend feasibility:
- **Max GPS Points:** Sample GPS points to a maximum of **500 points** for loop detection.
- **Simplification:** Apply the **Ramer-Douglas-Peucker (RDP)** algorithm to simplify the route polygon before running the H3 `polygonToCells` function.
- **Timeout:** The backend must process loop detection within **< 2 seconds** per run.
