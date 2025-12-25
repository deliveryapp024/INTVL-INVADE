# 02. Capture & Ownership Blueprint

## Competitive Control Aggregation Logic

### 1. Activity Ingestion & Eligibility
For every uploaded run:
- Map GPS points to H3 Res 8 indices.
- Calculate the total distance covered within *each* unique H3 index.
- If `distance_in_hex < MIN_ELIGIBILITY_THRESHOLD` (e.g., 0.5km), ignore that hex for this run's capture potential.

### 2. Aggregation Logic (Pseudo-code)

```python
def process_run(run_id, user_id, activities_in_hexes):
    """
    activities_in_hexes: List of { h3_index, distance }
    """
    current_cycle_id = get_current_cycle_id()
    
    for entry in activities_in_hexes:
        if entry.distance >= MIN_ELIGIBILITY_THRESHOLD:
            # 1. Update or Create Activity Score for this User/Hex/Cycle
            score = db.ActivityScore.find_or_create(
                user_id=user_id,
                h3_index=entry.h3_index,
                cycle_id=current_cycle_id
            )
            score.total_distance += entry.distance
            score.save()
            
            # 2. Re-evaluate Ownership for this Hex
            evaluate_ownership(entry.h3_index, current_cycle_id)

def evaluate_ownership(h3_index, cycle_id):
    # Find all scores for this hex in this cycle
    scores = db.ActivityScore.find(h3_index=h3_index, cycle_id=cycle_id)
    
    # Sort by total_distance descending
    leaderboard = scores.sort_by(total_distance, order=DESC)
    
    # Top user is the potential owner
    top_score = leaderboard.first()
    
    # Check if top_score surpasses the current owner or satisfies tie-breaker
    current_ownership = db.ZoneOwnership.find(h3_index=h3_index)
    
    if not current_ownership:
        # Initial capture
        db.ZoneOwnership.create(
            h3_index=h3_index,
            owner_id=top_score.user_id,
            captured_at=now()
        )
    elif top_score.user_id != current_ownership.owner_id:
        if top_score.total_distance > current_ownership.current_score:
            # Transfer of ownership
            current_ownership.previous_owner_id = current_ownership.owner_id
            current_ownership.owner_id = top_score.user_id
            current_ownership.captured_at = now()
            current_ownership.save()
```

## Tie-Breaker Logic
- **Rule:** If `top_score.total_distance == current_ownership.current_score`, the previous owner retains control (Defensive advantage).
- **Rule:** For initial capture (no current owner), if two users have the same score, the first to have achieved it (earliest activity timestamp) wins.

## Soft-Reset State Transition ("Defending Champion")
At the end of a cycle:
1.  Set `status = EXPIRED` for all `ZoneOwnership` records.
2.  Store the `owner_id` as `last_cycle_winner`.
3.  The UI displays the `last_cycle_winner` with a "Defending Champion" badge until a new capture occurs in the new cycle.
