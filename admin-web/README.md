# INVADE Admin Dashboard

A full-featured admin web dashboard for managing the INVADE running application with role-based access control, audit logging, push notifications, and compliance features.

## Features

### ✅ Completed

#### Backend (Node.js/Express)
- **RBAC (Role-Based Access Control)**
  - `superadmin`: Full system access
  - `admin`: CRUD operations, notifications, analytics
  - `support`: Read-only + limited support tools
  
- **Audit Logging**
  - All admin actions logged to `admin_audit_logs` table
  - Comprehensive audit trail for compliance
  - Log viewer API endpoints

- **Push Notifications (Firebase FCM)**
  - Firebase Admin SDK integration
  - Scheduled notifications via BullMQ + Redis
  - Target by: all users, segments, or specific users
  - Notification templates
  - Job tracking and retry logic
  - Per-token delivery results

- **Compliance Features**
  - GDPR data export jobs (DSAR)
  - Data retention policies
  - PII anonymization support
  - Automated retention runs

- **Admin API Endpoints**
  - User management (CRUD, suspend/unsuspend, anonymize)
  - Run management
  - Zone management
  - Achievement & challenge management
  - Notification management
  - Compliance management
  - Audit log viewing

- **Database Schema**
  - All new tables created via migration
  - Bootstrap SQL for initial admin accounts
  - Indexes for performance

#### Frontend (React + Vite)
- Modern React with TypeScript
- Tailwind CSS for styling
- React Query for data fetching
- Zustand for state management
- React Router for navigation
- Protected routes with role checks

### 🔄 In Progress
- TypeScript type refinements for Supabase queries
- Frontend page implementations
- Testing and QA

### ⏳ Next Steps
1. Install dependencies in admin-web (`npm install`)
2. Complete remaining frontend pages
3. Run database migrations on Supabase
4. Set up Firebase Admin SDK credentials
5. Configure environment variables
6. Deploy to Render

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase project
- Firebase project with Admin SDK
- Redis instance (for BullMQ)

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `REDIS_URL` (optional, for notifications)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

3. **Run database migrations:**
Execute the SQL in `supabase/migrations/20260215000000_admin_dashboard.sql` in your Supabase SQL editor.

4. **Start the server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies:**
```bash
cd admin-web
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env
```

Required variables:
- `VITE_API_URL=http://localhost:3001/api/v1`

3. **Start the dev server:**
```bash
npm run dev
```

### Initial Admin Accounts

After running the migration, the following accounts are bootstrapped as admins (if they exist in the auth system):

- `paralimatti@gmail.com` → superadmin
- `omkar2797@gmail.com` → admin
- `admin@gmail.com` → support

Make sure these users exist in your Supabase Auth before running the migration, or manually update their roles afterward.

## Deployment

### Render Deployment

1. **Create a Blueprint instance:**
   - Go to Render Dashboard → Blueprints
   - Connect your GitHub repository
   - Use the `render.yaml` file provided

2. **Set up environment variables:**
   In the Render dashboard, set these secrets for the backend service:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

3. **Upload Firebase credentials:**
   - Copy the contents of your Firebase service account key file
   - Add it as the `FIREBASE_PRIVATE_KEY` environment variable
   - Make sure to replace newlines with `\n`

4. **Deploy:**
   - Push to your main branch
   - Render will automatically deploy both backend and frontend

### Manual Deployment

#### Backend
```bash
cd backend
npm ci
npm run build
npm start
```

#### Frontend
```bash
cd admin-web
npm ci
npm run build
# Serve the `dist` folder with any static file server
```

## API Documentation

### Authentication
All admin endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Admin Endpoints

#### Users
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/:id` - Get user details
- `PUT /api/v1/admin/users/:id` - Update user
- `POST /api/v1/admin/users/:id/suspend` - Suspend user
- `POST /api/v1/admin/users/:id/unsuspend` - Unsuspend user
- `POST /api/v1/admin/users/:id/anonymize` - Anonymize user PII

#### Notifications
- `GET /api/v1/admin/notifications/templates` - List templates
- `POST /api/v1/admin/notifications/templates` - Create template
- `GET /api/v1/admin/notifications/jobs` - List notification jobs
- `POST /api/v1/admin/notifications/jobs` - Create notification job
- `POST /api/v1/admin/notifications/jobs/:id/cancel` - Cancel job
- `POST /api/v1/admin/notifications/jobs/:id/retry` - Retry failed job

#### Compliance
- `GET /api/v1/admin/compliance/export-jobs` - List data exports
- `POST /api/v1/admin/compliance/export-jobs` - Create export
- `GET /api/v1/admin/compliance/retention-policies` - List policies
- `POST /api/v1/admin/compliance/retention-policies` - Create policy
- `POST /api/v1/admin/compliance/retention-runs` - Run retention policy

#### Audit Logs
- `GET /api/v1/admin/audit-logs` - View audit logs
- `GET /api/v1/admin/audit-logs/stats` - Audit statistics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                        │
│              React + Vite Admin Dashboard                   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────────┐
│              Render Static Site (invade-admin)              │
└───────────────────────┬─────────────────────────────────────┘
                        │ API Calls
┌───────────────────────▼─────────────────────────────────────┐
│                Render Web Service (invade-api)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js Backend (Node.js)               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │  │
│  │  │ RBAC Middleware│ │ Audit Service │ │ Firebase FCM │ │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │  │
│  │  ┌─────────────┐  ┌─────────────┐                    │  │
│  │  │  BullMQ     │  │   Redis     │                    │  │
│  │  │   Queue     │  │             │                    │  │
│  │  └─────────────┘  └─────────────┘                    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  Supabase    │ │   Redis     │ │  Firebase   │
│  PostgreSQL  │ │  (BullMQ)   │ │    FCM      │
└──────────────┘ └─────────────┘ └─────────────┘
```

## Security Considerations

1. **Role-Based Access Control**: All endpoints check user roles
2. **Audit Logging**: Every admin action is logged
3. **JWT Authentication**: Secure token-based auth
4. **Rate Limiting**: Built-in rate limiting on API
5. **CORS**: Configured for specific origins only
6. **Data Anonymization**: Support for GDPR compliance
7. **Input Validation**: All inputs validated and sanitized

## License

MIT

## Support

For issues or questions:
- GitHub Issues: [your-repo]/issues
- Email: support@invade.app
