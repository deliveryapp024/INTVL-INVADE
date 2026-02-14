import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Get Supabase URL and anon key from environment variables
// In Expo, use EXPO_PUBLIC_ prefix for environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dawowfbfqfygjkugpdwq.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhd293ZmJmcWZ5Z2prdWdwZHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODgzNDMsImV4cCI6MjA4NjU2NDM0M30.U44IM3zGbsGpHRoO5FCkPqoE3XY-Kkzf-jLpBBquCkQ'

// Validate configuration
if (!supabaseAnonKey) {
  console.warn('⚠️  EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase features will not work.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Important for React Native
  },
})

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export default supabase
