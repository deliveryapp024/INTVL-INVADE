# 🚀 Deploy INVADE Backend to Render

Complete guide to deploy your INVADE backend to Render's free tier.

## Prerequisites

1. **GitHub Account** - For code hosting
2. **Render Account** - Sign up at https://render.com (use GitHub login)
3. **Backend Code Ready** - All files we created

## Step 1: Push Code to GitHub

```bash
# Initialize git in backend folder
cd C:\Users\prabh\Other Projects\INVTL\backend
git init

# Add all files
git add .

# Commit
git commit -m "Initial backend setup with Express + Supabase"

# Create GitHub repo (do this on github.com first)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/invade-backend.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `invade-backend` |
   | **Runtime** | `Node` |
   | **Region** | `Singapore` (closest to Supabase) |
   | **Branch** | `main` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | **Free** |

5. Click **"Create Web Service"**

### Option B: Using render.yaml (Blueprint)

1. Go to https://dashboard.render.com/blueprints
2. Click **"New Blueprint Instance"**
3. Connect your repo
4. Render will read `render.yaml` and auto-configure

## Step 3: Configure Environment Variables

In Render Dashboard → Your Service → **Environment**:

```bash
# Supabase (Required)
SUPABASE_URL=https://dawowfbfqfygjkugpdwq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhd293ZmJmcWZ5Z2prdWdwZHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgzNDMsImV4cCI6MjA4NjU2NDM0M30.U44IM3zGbsGpHRoO5FCkPqoE3XY-Kkzf-jLpBBquCkQ
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT (Required - generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Admin (Optional)
ADMIN_EMAILS=admin@example.com

# Firebase FCM (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n
# CORS (Update with your frontend URL)
CORS_ORIGINS=https://your-frontend-url.com,https://localhost:19006,http://localhost:19006
```

### How to Get Service Role Key:

```bash
npx supabase status
# Copy the "service_role_key" value
```

## Step 4: Deploy! 🎉

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for build (2-3 minutes)
3. Check logs for any errors
4. Test the health endpoint:
   ```
   https://invade-backend.onrender.com/health
   ```

## Your API URLs

| Endpoint | URL |
|----------|-----|
| **Base API** | `https://invade-backend.onrender.com/api/v1` |
| **Health** | `https://invade-backend.onrender.com/health` |
| **Metrics** | `https://invade-backend.onrender.com/metrics` |
| **Auth** | `https://invade-backend.onrender.com/api/v1/auth` |

## Step 5: Update Mobile App

Update your mobile app's environment:

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://invade-backend.onrender.com/api/v1
```

## Step 6: Setup MCP (Optional)

### Get Render API Key

1. Go to https://dashboard.render.com/settings/api-keys
2. Generate new API key
3. Copy the key

### Update MCP Config

Edit `C:\Users\prabh\Other Projects\INVTL\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_ACTUAL_RENDER_API_KEY"
      }
    }
  }
}
```

## Monitoring & Logs

### View Logs
- Render Dashboard → Your Service → **Logs**
- Real-time streaming
- Search and filter available

### Health Monitoring
```bash
# Test health endpoint
curl https://invade-backend.onrender.com/health

# Check metrics
curl https://invade-backend.onrender.com/metrics
```

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| **Hours** | 750/month (31.25 days) |
| **RAM** | 512 MB |
| **CPU** | 0.1 vCPU |
| **Sleep** | After 15 min inactivity |
| **Disk** | Ephemeral (use Supabase for persistence) |

### Keep Instance Alive (Optional)

Free tier sleeps after 15 min. To keep awake:

**Option 1: UptimeRobot (Free)**
1. Sign up at https://uptimerobot.com
2. Add monitor: `https://invade-backend.onrender.com/health`
3. Set interval: 5 minutes

**Option 2: cron-job.org (Free)**
1. Go to https://cron-job.org
2. Create job to ping `/health` every 10 minutes

## Troubleshooting

### Build Fails
```bash
# Check logs in Render Dashboard
# Common issues:
# 1. Missing environment variables
# 2. TypeScript compilation errors
# 3. Missing dependencies
```

### Database Connection Fails
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is active
- Ensure IP is not restricted in Supabase

### CORS Errors
- Update `CORS_ORIGINS` with your frontend URL
- Include `http://localhost:19006` for development

## Scaling Up (Paid Plans)

When ready to upgrade:

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | $7/mo | No sleep, 512 MB RAM |
| **Standard** | $25/mo | 2 GB RAM, 1 vCPU |
| **Pro** | $85/mo | 4 GB RAM, 2 vCPU |

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Connect mobile app
3. ✅ Setup Firebase FCM for push notifications
4. ✅ Configure custom domain (optional)
5. ✅ Setup monitoring alerts

---

## 🎉 Success!

Your backend is now live on Render!

```
🌐 API URL: https://invade-backend.onrender.com
📊 Health:  https://invade-backend.onrender.com/health
📚 Docs:    https://invade-backend.onrender.com/api/docs (if using Swagger)
```

Questions? Check Render docs: https://render.com/docs
