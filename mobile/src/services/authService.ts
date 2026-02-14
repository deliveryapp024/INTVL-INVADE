import { supabase } from '../lib/supabase'
import { User } from '../types/supabase'

export interface SignUpData {
  email: string
  password: string
  name: string
  username: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: User | null
  session: any
  error?: Error
}

class AuthService {
  // Sign up with email and password
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('User creation failed')

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          username: data.username,
          total_distance: 0,
          total_runs: 0,
          total_duration: 0,
          streak_days: 0,
          level: 1,
          coins: 0,
          is_verified: false,
        })

      if (profileError) throw profileError

      // Get the created user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      return {
        user,
        session: authData.session,
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) throw authError

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) throw userError

      return {
        user,
        session: authData.session,
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  // Sign out
  async signOut(): Promise<{ error?: Error }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return {}
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error as Error }
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error: error as Error }
    }
  }

  // Get current user with profile
  async getCurrentUser(): Promise<{ user: User | null; error?: Error }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!authUser) return { user: null }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) throw userError

      return { user }
    } catch (error) {
      console.error('Get current user error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ user: User | null; error?: Error }> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return { user }
    } catch (error) {
      console.error('Update profile error:', error)
      return { user: null, error: error as Error }
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default new AuthService()
