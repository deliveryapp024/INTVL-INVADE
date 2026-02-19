# INVADE Backend & Admin-Web: Complete Implementation Plan

## Executive Summary

**Current State:**
- ✅ Database: Comprehensive schema with 40+ tables
- ⚠️ Backend: Monolithic Express app with 5 basic endpoints
- ❌ Admin-Web: Empty directory structure, no React app

**Goal:** Production-ready backend API + Full-featured admin dashboard

**Timeline:** 8-10 weeks (single developer) or 5-6 weeks (2 developers)

---

## Phase 0: Foundation & Restructure (Week 1-2)

### Current Reality Check

```
server/src/
├── server.js          ✅ All routes here (monolithic - BAD)
├── routes/            ❌ Empty directory
├── controllers/       ❌ Empty directory  
├── middleware/        ❌ Empty directory
└── utils/             ❌ Empty directory

admin-web/
├── src/components/    ❌ Empty
├── src/pages/         ❌ Empty
├── src/services/      ❌ Empty
└── package.json       ❌ Doesn't exist
```

### Week 0.1: Backend Restructure (Days 1-3)

#### Tasks
1. **Modularize backend structure**
2. **Add authentication middleware**
3. **Add validation layer**
4. **Setup proper error handling**

#### New File Structure
```
server/src/
├── config/
│   └── database.js          # Supabase client config
├── middleware/
│   ├── auth.js              # JWT/Supabase auth verification
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Global error handler
├── utils/
│   ├── logger.js            # Winston logger
│   ├── response.js          # API response helpers
│   └── asyncHandler.js      # Async error wrapper
├── routes/
│   ├── index.js             # Route aggregator
│   ├── auth.js              # Auth routes
│   ├── users.js             # User routes
│   ├── runs.js              # Run routes
│   └── admin.js             # Admin-only routes
├── controllers/
│   ├── AuthController.js
│   ├── UserController.js
│   └── RunController.js
├── services/
│   ├── UserService.js
│   └── RunService.js
└── server.js                # Clean, minimal entry point
```

#### Files to Create

**server/src/middleware/auth.js**
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Verify Supabase JWT token
const verifySupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify admin role
const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = { verifySupabaseToken, requireAdmin };
```

**server/src/utils/asyncHandler.js**
```javascript
// Wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

**server/src/routes/index.js**
```javascript
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const runRoutes = require('./runs');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/runs', runRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
```

#### Fallback Options

**If full restructure is too time-consuming:**
- Keep routes in server.js temporarily
- Add auth middleware inline
- Migrate to modular structure in Phase 5

---

### Week 0.2: Admin-Web Setup (Days 4-7)

#### Option A: Vite + React + TypeScript (Recommended)

```bash
cd admin-web
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @tanstack/react-query axios react-router-dom lucide-react recharts
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

#### Option B: Next.js (If SEO/static generation needed)

```bash
cd admin-web
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir
npm install @tanstack/react-query axios lucide-react recharts
```

**Recommended: Option A (Vite)** - Admin dashboards don't need SSR

#### Admin-Web File Structure (Vite)

```
admin-web/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── ui/              # shadcn/ui or custom
    │   ├── layout/
    │   │   ├── Layout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Header.tsx
    │   └── common/
    │       ├── DataTable.tsx
    │       ├── StatCard.tsx
    │       └── Chart.tsx
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Users.tsx
    │   ├── Runs.tsx
    │   └── Login.tsx
    ├── hooks/
    │   ├── useAuth.ts
    │   └── useApi.ts
    ├── services/
    │   └── api.ts
    ├── types/
    │   └── index.ts
    └── utils/
        └── helpers.ts
```

#### Fallback Options

**If TypeScript is too complex:**
- Use JavaScript instead
- Remove type checking
- Keep same structure

**If time is critical:**
- Use a pre-built admin template (e.g., Materio, Berry)
- Customize instead of building from scratch
- Trade-off: Less customization but faster delivery

---

## Phase 1: Core Backend APIs (Week 3-4)

### Week 1: Routes & Trails API (Days 8-14)

#### Database Tables (Already Exist ✅)
- `routes` - Route information
- `route_points` - Route waypoints
- `route_reviews` - Route reviews
- `trails` - Trail information

#### API Endpoints to Implement

**Routes API**
```javascript
// GET /api/routes - List all routes with filters
// Query params: city, difficulty, type, distance_min, distance_max

// GET /api/routes/nearby - Get routes near location
// Query params: lat, lng, radius (km)

// GET /api/routes/popular - Get most popular routes

// GET /api/routes/:id - Get route details

// POST /api/routes - Create new route (protected)
// Body: name, description, distance, waypoints[], etc.

// POST /api/routes/:id/save - Bookmark route (protected)

// POST /api/routes/:id/review - Add review (protected)
```

**Trails API**
```javascript
// GET /api/trails - List all trails
// Query params: region, difficulty, season

// GET /api/trails/region/:region - Get by region
// Regions: western-ghats, himalayas, nilgiris, etc.

// GET /api/trails/:id - Get trail details

// POST /api/trails/:id/complete - Mark as completed (protected)
```

#### Implementation Priority

**Must-Have (Week 1):**
1. `GET /api/routes` - List routes
2. `GET /api/routes/:id` - Route details
3. `GET /api/trails` - List trails
4. `GET /api/trails/:id` - Trail details

**Nice-to-Have (Week 2):**
5. `GET /api/routes/nearby` - Location-based search
6. `POST /api/routes` - Create routes
7. POST/PUT/DELETE operations

#### Fallback Strategy

**If running behind:**
- Skip POST/PUT/DELETE for now (read-only API)
- Implement in Phase 5
- Mobile app can use Supabase directly for writes

---

### Week 2: Events & Clubs API (Days 15-21)

#### Database Tables (Already Exist ✅)
- `events` - Event information
- `event_participants` - RSVP data
- `clubs` - Club information
- `club_members` - Membership data

#### API Endpoints

**Events API**
```javascript
// GET /api/events - List events
// Query: upcoming, past, city, type

// GET /api/events/:id - Event details

// GET /api/events/:id/attendees - List attendees

// POST /api/events - Create event (protected)

// POST /api/events/:id/rsvp - RSVP (protected)
// Body: status (going/maybe/not_going)

// DELETE /api/events/:id/rsvp - Cancel RSVP (protected)
```

**Clubs API**
```javascript
// GET /api/clubs - List clubs
// Query: featured, nearby, city

// GET /api/clubs/:id - Club details

// GET /api/clubs/:id/members - List members

// GET /api/clubs/:id/events - Club events

// POST /api/clubs - Create club (protected)

// POST /api/clubs/:id/join - Join club (protected)

// POST /api/clubs/:id/leave - Leave club (protected)
```

#### Implementation Priority

**Must-Have:**
1. GET endpoints for all
2. POST /join and /leave

**Can Defer:**
- Club admin features (roles, moderation)
- Event creation (assume created via mobile/Supabase)

---

## Phase 2: Social & Safety APIs (Week 5-6)

### Week 3: Activity Feed & Social (Days 22-28)

#### Database Tables (Already Exist ✅)
- `activity_feed` - Feed items
- `kudos` - Likes
- `comments` - Comments

#### API Endpoints

**Feed API**
```javascript
// GET /api/feed - Get main feed
// Query: page, limit, type

// GET /api/feed/user/:userId - Get user's activities

// POST /api/feed/activity/:id/kudos - Give kudos (protected)

// DELETE /api/feed/activity/:id/kudos - Remove kudos (protected)

// GET /api/feed/activity/:id/comments - Get comments

// POST /api/feed/activity/:id/comments - Add comment (protected)
```

### Week 4: Safety API (Days 29-35)

#### Database Tables (Already Exist ✅)
- `emergency_contacts` - Emergency contacts
- `safety_events` - SOS events
- `live_location_shares` - Live location sharing

#### API Endpoints

**Safety API** (All protected)
```javascript
// Emergency Contacts
// GET /api/safety/contacts - List contacts
// POST /api/safety/contacts - Add contact
// DELETE /api/safety/contacts/:id - Remove contact

// Live Location Sharing
// POST /api/safety/live-share/start - Start sharing
// POST /api/safety/live-share/:id/stop - Stop sharing

// SOS
// POST /api/safety/sos - Trigger SOS
// POST /api/safety/sos/:id/cancel - Cancel SOS
```

**Note:** Live location updates should use Supabase Realtime, not HTTP API.

---

## Phase 3: Admin Dashboard (Week 7-8)

### Admin Pages to Build

#### Week 5: Core Pages (Days 36-42)

1. **Login Page**
   - Supabase auth integration
   - JWT token storage
   - Redirect to dashboard

2. **Dashboard Page** (Enhanced)
   - Stats cards: Users, Runs, Routes, Trails, Clubs, Events
   - Charts: User growth, Run activity
   - Recent activity feed
   - Quick actions

3. **Users Management**
   - Data table with pagination
   - Search & filters
   - View user details
   - Ban/unban users
   - Edit user role

#### Week 6: Content Management (Days 43-49)

4. **Routes Management**
   - List all routes
   - Verify/unverify routes
   - Delete inappropriate routes
   - View route details & stats

5. **Trails Management**
   - List all trails
   - Add new trails (admin)
   - Edit trail info
   - Delete trails

6. **Events Management**
   - List all events
   - Feature events (homepage)
   - Cancel events
   - View attendees

7. **Clubs Management**
   - List all clubs
   - Verify clubs
   - Suspend clubs
   - View club members

#### Week 7-8: Advanced Features (Days 50-63)

8. **Activity Feed Moderation**
   - View all posts
   - Hide/unhide posts
   - Delete inappropriate content

9. **Safety Dashboard**
   - Active SOS alerts
   - Live location monitoring
   - Safety incident reports

10. **Challenges Management**
    - Create challenges
    - Edit challenges
    - View participants
    - End challenges

11. **Subscriptions/Premium**
    - View premium users
    - Grant/revoke premium
    - View revenue stats

12. **Notifications**
    - Send push notifications
    - Schedule notifications
    - View notification history

---

## Phase 4: Admin API Endpoints (Week 9)

### Admin-Only Endpoints

```javascript
// Admin Routes (all require admin role)

// Users Admin
// GET /api/admin/users - List all users (with pagination)
// PUT /api/admin/users/:id/ban - Ban user
// PUT /api/admin/users/:id/role - Change role

// Content Moderation
// GET /api/admin/feed - All posts (including hidden)
// POST /api/admin/feed/:id/hide - Hide post
// POST /api/admin/feed/:id/unhide - Unhide post

// Routes Admin
// GET /api/admin/routes - All routes
// POST /api/admin/routes/:id/verify - Verify route
// DELETE /api/admin/routes/:id - Delete route

// Trails Admin
// GET /api/admin/trails - All trails
// POST /api/admin/trails - Create trail
// PUT /api/admin/trails/:id - Update trail
// DELETE /api/admin/trails/:id - Delete trail

// Events Admin
// GET /api/admin/events - All events
// POST /api/admin/events/:id/feature - Feature event
// POST /api/admin/events/:id/cancel - Cancel event

// Clubs Admin
// GET /api/admin/clubs - All clubs
// POST /api/admin/clubs/:id/verify - Verify club
// POST /api/admin/clubs/:id/suspend - Suspend club

// Safety Admin
// GET /api/admin/sos-alerts - Active SOS alerts
// POST /api/admin/sos-alerts/:id/resolve - Resolve alert

// Challenges Admin
// GET /api/admin/challenges - All challenges
// POST /api/admin/challenges - Create challenge
// PUT /api/admin/challenges/:id - Update challenge

// Subscriptions Admin
// GET /api/admin/subscriptions - All subscriptions
// POST /api/admin/subscriptions/grant - Grant premium

// Notifications Admin
// POST /api/admin/notifications/send - Send notification
// POST /api/admin/notifications/schedule - Schedule notification

// Analytics
// GET /api/admin/analytics/overview - Dashboard stats
// GET /api/admin/analytics/users - User analytics
// GET /api/admin/analytics/runs - Run analytics
```

---

## Phase 5: Testing & Polish (Week 10)

### Testing Checklist

**Backend Testing:**
- [ ] All endpoints return correct status codes
- [ ] Authentication works correctly
- [ ] Admin-only endpoints reject non-admins
- [ ] Input validation works
- [ ] Error handling works
- [ ] Pagination works on list endpoints

**Admin-Web Testing:**
- [ ] Login/logout flow
- [ ] All pages load correctly
- [ ] Data tables work with pagination
- [ ] Forms submit correctly
- [ ] Charts render correctly
- [ ] Responsive design works

### Performance Optimization

**Backend:**
- Add Redis caching for frequently accessed data
- Optimize database queries with indexes
- Add rate limiting
- Implement request logging

**Admin-Web:**
- Implement data caching (React Query)
- Lazy load pages
- Optimize bundle size
- Add loading states

---

## Fallback Strategies

### Scenario 1: Running Behind Schedule

**Week 3-4 Fallback:**
- Skip POST/PUT/DELETE endpoints
- Mobile app uses Supabase directly for writes
- Backend provides read-only APIs
- Add write endpoints in maintenance phase

**Week 7-8 Fallback:**
- Build only core admin pages: Dashboard, Users, Routes
- Use Supabase Dashboard for other management tasks
- Add more pages incrementally

### Scenario 2: Limited Resources

**MVP Approach (6 weeks):**
1. Backend restructure (1 week)
2. Admin-web setup + basic pages (2 weeks)
3. Routes/Trails API + Pages (1 week)
4. Events/Clubs API + Pages (1 week)
5. Safety API (1 week)

Skip: Activity feed moderation, Challenges, Subscriptions, Analytics

### Scenario 3: Technical Blockers

**If Supabase auth is problematic:**
- Use simple API key authentication for admin
- Implement custom JWT solution
- Document security trade-offs

**If React is too complex:**
- Use vanilla HTML + JavaScript
- Or use a low-code tool (Retool, Appsmith)
- Trade-off: Less customization, faster delivery

---

## Resource Requirements

### Personnel

**Option A: Single Developer (10 weeks)**
- Full-stack developer comfortable with Node.js + React
- Can handle backend restructure + API + frontend

**Option B: Two Developers (6 weeks)**
- Developer 1: Backend (Node.js, Supabase)
- Developer 2: Frontend (React, Tailwind)

**Option C: Hire Help (4-5 weeks)**
- Keep existing structure
- Hire freelancers for specific phases
- Manage integration

### Tools & Services

**Required:**
- Node.js 18+
- Supabase project (already exists)
- Git repository
- Code editor (VS Code recommended)

**Recommended:**
- Render/Railway for backend hosting
- Vercel/Netlify for admin-web hosting
- Postman for API testing
- Figma for UI design

---

## Success Metrics

**Backend:**
- ✅ All mobile app features have corresponding API endpoints
- ✅ Authentication works correctly
- ✅ Admin endpoints secured
- ✅ Response time < 200ms for most endpoints
- ✅ 95%+ test coverage (if tests written)

**Admin-Web:**
- ✅ All GLM 5 pages implemented
- ✅ Can perform all CRUD operations
- ✅ Responsive design (mobile + desktop)
- ✅ Load time < 3 seconds

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Backend restructure breaks existing API | Medium | High | Keep old endpoints, add new ones gradually |
| Supabase auth complexity | Medium | Medium | Use API keys for admin initially |
| Time overrun | High | High | Use MVP fallback, prioritize must-haves |
| Admin-web complexity | Medium | Medium | Use pre-built templates |
| Database migration issues | Low | High | Test migrations in staging first |

---

## Weekly Milestones

| Week | Deliverable | Success Criteria |
|------|-------------|------------------|
| 1 | Backend restructured | Modular structure, auth middleware working |
| 2 | Admin-web scaffolded | React app running, login page working |
| 3 | Routes/Trails API | GET endpoints working, tested |
| 4 | Events/Clubs API | GET endpoints working, tested |
| 5 | Social API + Dashboard | Feed endpoints, dashboard page |
| 6 | Safety API + Content Mgmt | Safety endpoints, Routes/Trails pages |
| 7 | Events/Clubs Pages | Full CRUD pages for events & clubs |
| 8 | Advanced Features | Safety, Challenges, Subscriptions pages |
| 9 | Admin API | All admin endpoints implemented |
| 10 | Testing & Polish | All tests passing, bugs fixed |

---

## Next Steps

1. **Review this plan** and approve/modify
2. **Decide on team size** (1 vs 2 developers)
3. **Choose admin-web approach** (Vite vs template)
4. **Set up staging environment** for testing
5. **Start with Week 0: Backend Restructure**

---

**Questions to Consider:**

1. Do you want me to start implementing Week 0 right now?
2. Single developer or team of 2?
3. Full feature set or MVP first?
4. Any specific tech preferences?

Ready to proceed when you are! 🚀
