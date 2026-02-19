require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://dawowfbfqfygjkugpdwq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required');
  console.error('Please set the environment variable in Render Dashboard');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('📊 [API] GET /api/users - Fetching users...');
    console.log('📍 Request from:', req.headers.origin || 'unknown');
    console.log('🔑 Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Supabase connection test failed:', testError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: testError.message 
      });
    }
    
    console.log('✅ Supabase connected, fetching users...');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch users',
        details: error.message 
      });
    }

    console.log(`✅ Found ${users?.length || 0} users`);
    console.log('📋 First user:', users[0] ? { 
      id: users[0].id, 
      email: users[0].email,
      username: users[0].username 
    } : 'None');
    
    // Transform data for admin dashboard
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || user.display_name || 'Unknown',
      username: user.username || 'unknown',
      role: user.role || 'user',
      status: user.is_verified ? 'active' : 'pending',
      level: user.level || 1,
      runs: user.total_runs || 0,
      created_at: user.created_at,
      avatar_url: user.avatar_url,
      total_distance: user.total_distance || 0,
      streak_days: user.streak_days || 0
    }));

    console.log(`📤 Sending ${formattedUsers.length} formatted users to client`);
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all runs
app.get('/api/runs', async (req, res) => {
  try {
    const { data: runs, error } = await supabase
      .from('runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch runs' });
    }

    res.json(runs || []);
  } catch (error) {
    console.error('Error fetching runs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get run count
    const { count: runCount, error: runError } = await supabase
      .from('runs')
      .select('*', { count: 'exact', head: true });

    // Get recent users
    const { data: recentUsers, error: recentError } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (userError || runError) {
      console.error('Error fetching stats:', userError || runError);
    }

    res.json({
      totalUsers: userCount || 0,
      totalRuns: runCount || 0,
      recentUsers: recentUsers || []
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test Supabase connection
app.get('/api/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        connected: false,
        error: error.message,
        details: 'Failed to connect to Supabase'
      });
    }

    res.json({
      connected: true,
      message: 'Successfully connected to Supabase',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Debug endpoint for admin panel
app.get('/api/debug', async (req, res) => {
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase_connected: !error,
      supabase_error: error?.message || null,
      user_count: data?.length || 0,
      users_sample: data?.map(u => ({ id: u.id, email: u.email, username: u.username })),
      env: {
        supabase_url: supabaseUrl,
        has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_anon_key: !!process.env.SUPABASE_ANON_KEY
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║     🚀 INVADE Backend Server             ║
║                                          ║
║     Running on port ${PORT}                 ║
║                                          ║
╚══════════════════════════════════════════╝
  `);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   • GET  /health           - Health check`);
  console.log(`   • GET  /api/test-connection - Test Supabase connection`);
  console.log(`   • GET  /api/users        - Get all users`);
  console.log(`   • GET  /api/users/:id    - Get user by ID`);
  console.log(`   • GET  /api/runs         - Get all runs`);
  console.log(`   • GET  /api/stats        - Get dashboard stats`);
  console.log(`\n✨ Server is ready!\n`);
});

module.exports = app;
