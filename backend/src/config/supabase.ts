import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import config from './index'

// Create Supabase client for backend operations
export const supabase: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    db: {
      schema: 'public'
    }
  }
)

// Create a function to get a client with user context
export const getSupabaseWithAuth = (authToken: string): SupabaseClient<Database> => {
  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    }
  )
}

// Admin client with service role for privileged operations
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabase
