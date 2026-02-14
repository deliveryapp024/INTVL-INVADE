# Bug Fixes and Issues Summary
*Last Updated: 2025-12-26T01:01:18+05:30*

### 1. Database Connection & Docker Port Conflict
**Issue:** `prisma migrate` failed due to connection refused. Docker container port 5432 was conflicted with a local Postgres instance.
**Solution:** 
- Updated `docker-compose.yml` to map host port `5433` to container `5432`.
- Updated `.env` to use `localhost:5433` for `DATABASE_URL`.
- Restarted Docker services.

### 2. Prisma File Lock (EPERM)
**Issue:** `prisma generate` failed with `EPERM: operation not permitted` on `query_engine-windows.dll.node`.
**Solution:** 
- Forcefully terminated lingering Node.js processes (`taskkill /F /IM node.exe`).
- Deleted the `.prisma` folder to clear locks.
- Ran `npx prisma generate` successfully.

### 3. Syntax Error in Controller
**Issue:** `runs.controller.ts` had a syntax error (extra `});` and missing `}`) causing compilation/test failure.
**Solution:** Removed the erroneous lines and corrected the `try-catch` block structure.

### 4. Integration Test 403 Forbidden
**Issue:** E2E test failed with 403 Forbidden because the test used `userId='e2e-test-user'` while the mock Controller default was `test-user-id`.
**Solution:** Updated `runs.e2e.test.ts` to use `test-user-id` to align with the controller's mock authentication.

### 5. Expo Runtime Error (TextDecoder)
**Issue:** `TypeError: Cannot read property 'decode' of undefined` and `Invariant Violation: "main" has not been registered` causing app crash on launch.
**Solution:**
- Identified that `package.json` `"main"` was pointing directly to `expo-router/entry`, bypassing `polyfills.js`.
- Updated `mobile/package.json` `"main"` to `"./polyfills.js"` to ensure `TextDecoder` polyfill is loaded before the app entry.
