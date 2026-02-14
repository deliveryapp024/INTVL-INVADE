#!/bin/bash

# API Test Script for INVADE Admin Dashboard
# Tests the admin endpoints

BASE_URL="http://localhost:3001/api/v1"

echo "🧪 Testing INVADE Admin API Endpoints"
echo "======================================"

# Test 1: Health check
echo -e "\n1. Health Check"
curl -s $BASE_URL/admin/health | jq .

# Test 2: System stats (no auth required for some)
echo -e "\n2. System Stats"
curl -s $BASE_URL/admin/stats | jq .

# Test 3: Try to access protected endpoint without auth
echo -e "\n3. Users endpoint (no auth - should fail)"
curl -s $BASE_URL/admin/users | jq .

echo -e "\n✅ Basic API tests complete!"
echo -e "\nTo test authenticated endpoints:"
echo "1. Login at POST /api/v1/auth/login with admin credentials"
echo "2. Use the returned token in Authorization header"
echo ""
echo "Admin credentials:"
echo "  - paralimatti@gmail.com (superadmin)"
echo "  - omkar2797@gmail.com (admin)"
echo "  - admin@gmail.com (support)"
