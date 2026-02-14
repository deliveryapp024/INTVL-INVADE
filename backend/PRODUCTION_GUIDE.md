# INVADE Backend - Production Guide 🚀

This guide covers all the production-ready features added to make your backend enterprise-grade.

## ✨ Awesome Features Added

### 1. **Request Tracing**
- Every request gets a unique `X-Request-Id` header
- Enables distributed tracing across services
- Makes debugging much easier

### 2. **Advanced Health Checks**
Multiple health endpoints for monitoring:
- `GET /health` - Basic health with database connectivity
- `GET /health/detailed` - Detailed system metrics
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### 3. **Metrics Collection**
Built-in metrics at `/metrics`:
- Request counts by endpoint and status
- Response time histograms (p50, p95, p99)
- Active request tracking
- Memory usage monitoring
- Authenticated vs anonymous request tracking

Supports both JSON and Prometheus formats!

### 4. **Smart Caching**
In-memory caching with:
- Route-level cache middleware
- Automatic cache invalidation patterns
- Cache hit/miss headers
- Configurable TTL per route

### 5. **Admin Dashboard API**
Complete admin endpoints at `/api/v1/admin`:
- System stats and metrics
- User management
- Cache control
- Feature flags
- Database backup trigger

### 6. **Webhook System**
Full webhook infrastructure:
- Register webhooks for events
- Automatic retry with exponential backoff
- Signature verification
- Delivery logs
- Auto-disable on repeated failures

### 7. **Enhanced Security**
- Helmet.js for security headers
- CORS with origin validation
- Rate limiting per IP and user
- Stricter rate limits for auth endpoints
- Request sanitization

### 8. **API Documentation**
- Swagger UI at `/api/docs` (development)
- OpenAPI spec at `/api/openapi.json`
- Self-documenting endpoints

### 9. **Production Monitoring**
- Winston logger with structured logging
- Request/response logging
- Error tracking
- Performance monitoring

## 🔧 Environment Variables

### Required
```env
SUPABASE_URL=https://dawowfbfqfygjkugpdwq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

### Admin Configuration
```env
ADMIN_EMAILS=admin@example.com,support@invade.app
```

### Optional Features
```env
ENABLE_REAL_TIME=true
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=true
ENABLE_NEW_ZONES=true
```

### Webhook Settings
```env
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY_MS=5000
WEBHOOK_TIMEOUT_MS=30000
```

## 📊 Monitoring Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/health` | Basic health check | No |
| `/health/detailed` | System metrics | Optional |
| `/health/ready` | K8s readiness | No |
| `/health/live` | K8s liveness | No |
| `/metrics` | Prometheus metrics | No |
| `/api/openapi.json` | API documentation | No |
| `/api/docs` | Swagger UI (dev) | No |

## 🔐 Admin API

### Get System Stats
```bash
GET /api/v1/admin/stats
Authorization: Bearer <token>
```

### List Users
```bash
GET /api/v1/admin/users?limit=50&offset=0
Authorization: Bearer <token>
```

### Clear Cache
```bash
POST /api/v1/admin/cache/clear
Authorization: Bearer <token>
```

### Trigger Backup
```bash
POST /api/v1/admin/backup
Authorization: Bearer <token>
```

### Manage Feature Flags
```bash
GET /api/v1/admin/features
PATCH /api/v1/admin/features/:name
Authorization: Bearer <token>
Body: { "enabled": true }
```

## 🎣 Webhook API

### Register Webhook
```bash
POST /api/v1/webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["run.completed", "zone.captured"],
  "secret": "optional-secret"
}
```

### Get Deliveries
```bash
GET /api/v1/webhooks/:id/deliveries?limit=50
Authorization: Bearer <admin-token>
```

### Webhook Events Available
- `user.created`
- `user.updated`
- `run.started`
- `run.completed`
- `zone.captured`
- `achievement.earned`
- `challenge.completed`

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Set all required environment variables
- [ ] Configure admin emails
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable RLS policies in Supabase
- [ ] Run database migrations
- [ ] Test health endpoints
- [ ] Verify rate limiting works

### Security
- [ ] Enable CORS for production domains only
- [ ] Set up SSL/TLS
- [ ] Configure rate limits appropriately
- [ ] Enable Helmet security headers
- [ ] Set up API key rotation schedule

### Monitoring
- [ ] Set up log aggregation (Winston → CloudWatch/ELK)
- [ ] Configure metrics collection (Prometheus/Grafana)
- [ ] Set up alerts for errors and high latency
- [ ] Monitor memory usage
- [ ] Track cache hit rates

### Scaling
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Set up Redis for distributed caching
- [ ] Use connection pooling for database
- [ ] Set up read replicas if needed

## 🐳 Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]
```

## ☸️ Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: invade-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: invade-backend
  template:
    metadata:
      labels:
        app: invade-backend
    spec:
      containers:
      - name: backend
        image: invade/backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: invade-config
        - secretRef:
            name: invade-secrets
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📈 Performance Tips

1. **Enable Redis**: Set `REDIS_URL` for distributed caching
2. **Use CDN**: Serve static assets via CDN
3. **Database Indexes**: All tables have proper indexes
4. **Connection Pooling**: Supabase handles this automatically
5. **Query Optimization**: Use `select()` with specific columns
6. **Cache Strategically**: Cache leaderboard, zones, achievements
7. **Rate Limiting**: Protects against abuse

## 🔍 Debugging

### Check Request Tracing
```bash
curl -H "X-Request-Id: debug-123" http://localhost:3001/api/v1/runs
# Look for X-Request-Id in response headers
```

### View Metrics
```bash
curl http://localhost:3001/metrics
# Or Prometheus format:
curl -H "Accept: application/openmetrics" http://localhost:3001/metrics
```

### Check Cache Stats
```bash
curl http://localhost:3001/api/v1/admin/stats \
  -H "Authorization: Bearer <admin-token>"
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Prometheus Metrics](https://prometheus.io/docs/introduction/overview/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

**Your backend is now enterprise-ready!** 🎉

All the code follows best practices:
- ✅ TypeScript throughout
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Security best practices
- ✅ Monitoring and observability
- ✅ Scalable architecture
- ✅ Production-ready configuration
