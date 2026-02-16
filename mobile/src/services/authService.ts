import { supabase } from '../lib/supabase'
import { User } from '../types/supabase'

export interface SignUpData {
  email: string
  password: string
  name: string
  username: string
  date_of_birth?: string
  phone?: string
  location_city?: string
  location_country?: string
  latitude?: number
  longitude?: number
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

      // Create user profile in database with all fields
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          username: data.username,
          date_of_birth: data.date_of_birth || null,
          phone: data.phone || null,
          location_city: data.location_city || null,
          location_country: data.location_country || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
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

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.intvlinvade.app://auth/callback',
        },
      })

      if (error) throw error

      // The OAuth flow will redirect back to the app
      // The actual user data will be handled by onAuthStateChange
      return {
        user: null,
        session: null,
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  // Sign in with Apple
  async signInWithApple(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'com.intvlinvade.app://auth/callback',
        },
      })

      if (error) throw error

      return {
        user: null,
        session: null,
      }
    } catch (error) {
      console.error('Apple sign in error:', error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  // Handle OAuth callback and create/update user profile
  async handleOAuthCallback(access_token: string, refresh_token: string): Promise<AuthResponse> {
    try {
      // Set the session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (sessionError) throw sessionError
      if (!sessionData.user) throw new Error('No user in session')

      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

      if (!existingUser) {
        // Create new user profile from OAuth data
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || '',
            username: this.generateUsername(sessionData.user.email),
            avatar_url: sessionData.user.user_metadata?.avatar_url || null,
            total_distance: 0,
            total_runs: 0,
            total_duration: 0,
            streak_days: 0,
            level: 1,
            coins: 0,
            is_verified: true,
          })

        if (createError) throw createError
      }

      // Get user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.user.id)
        .single()

      if (userError) throw userError

      return {
        user,
        session: sessionData.session,
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return {
        user: null,
        session: null,
        error: error as Error,
      }
    }
  }

  // Generate a unique username from email
  private generateUsername(email: string | undefined): string {
    if (!email) return 'user_' + Date.now()
    
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const random = Math.floor(Math.random() * 10000)
    return `${base}_${random}`
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

  // Check if username is available
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: Error }> {
    try {
      const { data, error } = await supabase
        .rpc('is_username_available', { check_username: username })

      if (error) throw error

      return { available: data }
    } catch (error) {
      console.error('Check username error:', error)
      return { available: false, error: error as Error }
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default new AuthService()
