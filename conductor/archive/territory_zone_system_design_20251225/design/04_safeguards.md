# 04. Safeguards & UX Logic

## Anti-Gaming Rules

### 1. Speed Thresholds
- **Max Sustained Speed:** **25 km/h** (approx. 2:24 min/km pace). Activities with sustained segments above this speed are flagged for manual review or auto-rejected.
- **Max Instantaneous Speed:** **35 km/h**. Single data points exceeding this are discarded as GPS noise.

### 2. Acceleration Limits
- **Max Acceleration:** **5.0 m/s²**. Sudden jumps in speed (e.g., jumping from 5 km/h to 30 km/h in 1 second) indicate vehicle transport or GPS spoofing.

### 3. Effort Minimums (Eligibility)
- **Min Total Distance:** **0.5 km**.
- **Min Total Duration:** **5 minutes**.
- **Static Check:** Activities with high total distance but zero displacement (e.g., GPS drift in a stationary room) are rejected.

## User Feedback Loop (UX Logic)

### 1. Successful Capture
- **Trigger:** Run processed and top score achieved.
- **Feedback:** 
    - Push Notification: "You just captured [Zone Name/ID]!"
    - In-App: Full-screen celebration overlay with the zone hex highlighted in the user's color.

### 2. Failed Capture / Contested
- **Trigger:** Run processed but score is lower than current owner.
- **Feedback:** "Great run! You're now #[Rank] in [Zone Name]. Run [Distance] more to take the lead."

### 3. Closed-Loop Feedback
- **Successful:** "Loop Master! You've enclosed [X] zones."
- **Near-Miss:** "Almost a loop! Your start and end were [Distance] apart. Close the gap next time for a bonus." (Triggered if proximity > 50m but < 200m).

### 4. Anti-Gaming Flag
- **Feedback:** "Activity Flagged. Some data points seem inconsistent with running. If you believe this is an error, contact support." (Avoid accusing of cheating directly).
