# INVADE Backend Server

Express.js backend server for INVADE admin dashboard and API.

## 🚀 Quick Start

### Local Development

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
SUPABASE_URL=https://dawowfbfqfygjkugpdwq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
```

**Get your Service Role Key from:**
1. Supabase Dashboard → Project Settings → API
2. Copy the `service_role` key (NOT the anon key!)

### Deploy to Render

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Set Build Command:**
   ```
   cd server && npm install
   ```
4. **Set Start Command:**
   ```
   cd server && npm start
   ```
5. **Add Environment Variables:**
   - `SUPABASE_URL`: `https://dawowfbfqfygjkugpdwq.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## 📍 API Endpoints

### Health Check
```
GET /health
```

### Test Supabase Connection
```
GET /api/test-connection
```

### Get All Users
```
GET /api/users
```

### Get User by ID
```
GET /api/users/:id
```

### Get All Runs
```
GET /api/runs
```

### Get Dashboard Stats
```
GET /api/stats
```

## 🔒 Security

- Uses Helmet for security headers
- CORS enabled for all origins
- Service Role Key required for Supabase access
- Input validation on all endpoints

## 📊 Logs

View logs in Render Dashboard → Logs tab
