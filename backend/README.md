# INVADE Backend API

Production-ready backend for INVADE running app built with Node.js, Express, and Supabase.

## Features

- ✅ JWT Authentication with Supabase Auth
- ✅ CRUD operations for Runs, Zones, Achievements, Challenges
- ✅ Real-time location tracking
- ✅ Zone capture system
- ✅ Achievement and Challenge progress tracking
- ✅ Social features (Friends, Leaderboards)
- ✅ Push notifications support
- ✅ Rate limiting and security headers
- ✅ TypeScript throughout

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth + JWT
- **Validation**: Custom validation middleware
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Development

```bash
npm run dev
```

### 4. Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | ❌ |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh tokens
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/me` - Update profile

### Runs
- `POST /api/v1/runs` - Create run
- `GET /api/v1/runs` - Get user's runs
- `GET /api/v1/runs/:id` - Get run details
- `POST /api/v1/runs/:id/complete` - Complete run
- `POST /api/v1/runs/coordinates` - Save coordinate

### Zones
- `GET /api/v1/zones` - Get all zones
- `GET /api/v1/zones/nearby` - Get nearby zones
- `POST /api/v1/zones/:id/capture` - Capture zone

### Users
- `GET /api/v1/users/leaderboard` - Get leaderboard
- `POST /api/v1/users/friends/request` - Send friend request
- `GET /api/v1/users/friends/requests` - Get pending requests

### Achievements
- `GET /api/v1/achievements` - Get all achievements
- `GET /api/v1/achievements/user/:id` - Get user's achievements

### Challenges
- `GET /api/v1/challenges` - Get active challenges
- `POST /api/v1/challenges/:id/join` - Join challenge
- `POST /api/v1/challenges/:id/progress` - Update progress

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration (Supabase, env)
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities (logger, calculations)
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── logs/               # Log files
├── .env.example        # Environment template
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## License

MIT
