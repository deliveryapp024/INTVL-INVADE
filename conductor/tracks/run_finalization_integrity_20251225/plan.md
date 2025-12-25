# Plan: Run Finalization & Integrity Layer

### Phase 1: Schema Updates & Data Layer
- [x] Task: Update Prisma schema with new Run fields (status, reject_reason, computed_metrics)
- [x] Task: Generate and apply database migrations
- [x] Task: Update `RunStore` and types to support status transitions and metric storage
- [ ] Task: Conductor - User Manual Verification 'Schema Updates & Data Layer' (Protocol in workflow.md)

### Phase 2: Core Metric Derivation Engine
- [x] Task: Implement Haversine distance utility with double-precision support
- [x] Task: Write tests for GPS point chronological sorting
- [x] Task: Implement GPS point sorting logic
- [x] Task: Write tests for server-side metric derivation (distance, duration, max speed)
- [x] Task: Implement metric derivation logic
- [ ] Task: Conductor - User Manual Verification 'Core Metric Derivation Engine' (Protocol in workflow.md)

### Phase 3: Validation & Integrity Rules (Anti-Cheat v0)
- [x] Task: Write tests for validation rules (Speed, Duration, Distance thresholds)
- [x] Task: Implement validation logic for core thresholds
- [x] Task: Write tests for GPS Integrity (Time and Distance gap checks)
- [x] Task: Implement GPS Integrity validation logic
- [ ] Task: Conductor - User Manual Verification 'Validation & Integrity Rules' (Protocol in workflow.md)

### Phase 4: Finalization API & Lifecycle
- [x] Task: Write tests for `POST /api/runs/:id/finalize` (Happy path, rejection paths, authorization)
- [x] Task: Implement Finalization endpoint with status transition logic
- [x] Task: Write tests for Idempotency behavior on the Finalization endpoint
- [x] Task: Implement Idempotency logic for repeated finalization calls
- [ ] Task: Conductor - User Manual Verification 'Finalization API & Lifecycle' (Protocol in workflow.md)

### Phase 5: Integration & Verification
- [x] Task: Perform full end-to-end test of the Run upload -> Finalization flow
- [x] Task: Ensure client-provided summary stats are ignored post-ingestion
- [x] Task: Verify determinism of the finalization process
- [ ] Task: Conductor - User Manual Verification 'Integration & Verification' (Protocol in workflow.md)
