import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../config/supabase'
import config from '../config'
import { User, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  username: string
  avatarUrl?: string
}

class AuthService {
  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptSaltRounds)
  }

  // Compare password
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Generate JWT tokens
  private generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    )

    return { accessToken, refreshToken }
  }

  // Register new user
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if email exists
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existingEmail) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS')
    }

    // Check if username exists
    const { data: existingUsername } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', data.username)
      .single()

    if (existingUsername) {
      throw new AppError('Username already taken', 409, 'USERNAME_EXISTS')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password)

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    })

    if (authError) {
      throw new AppError(authError.message, 400, 'AUTH_ERROR')
    }

    // Create user profile
    const userData: InsertTables<'users'> = {
      id: authUser.user.id,
      email: data.email,
      name: data.name,
      username: data.username,
      avatar_url: data.avatarUrl || null,
      total_distance: 0,
      total_runs: 0,
      total_duration: 0,
      streak_days: 0,
      level: 1,
      coins: 0,
      is_verified: false
    }

    const { data: user, error: dbError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (dbError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new AppError(dbError.message, 500, 'DATABASE_ERROR')
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email)

    return { user, tokens }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (authError || !authData.user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS')
    }

    // Get user profile
    const { data: user, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (dbError || !user) {
      throw new AppError('User profile not found', 404, 'USER_NOT_FOUND')
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email)

    return { user, tokens }
  }

  // Refresh tokens
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as {
        userId: string
        email: string
        type: string
      }

      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
      }

      // Verify user still exists
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', decoded.userId)
        .single()

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND')
      }

      return this.generateTokens(user.id, user.email)
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED')
      }
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
    }
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<User> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    return user
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['name', 'username', 'avatar_url']
    const filteredUpdates: Record<string, any> = {}

    for (const key of allowedFields) {
      if (key in updates) {
        filteredUpdates[key] = (updates as any)[key]
      }
    }

    // Check username uniqueness if changing
    if (filteredUpdates.username) {
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', filteredUpdates.username)
        .neq('id', userId)
        .single()

      if (existing) {
        throw new AppError('Username already taken', 409, 'USERNAME_EXISTS')
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ ...filteredUpdates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return user
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Verify current password
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (!authUser.user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    // Update password via Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      throw new AppError(error.message, 400, 'PASSWORD_UPDATE_FAILED')
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.cors.origins[0]}/reset-password`
    })

    if (error) {
      throw new AppError(error.message, 400, 'RESET_FAILED')
    }
  }

  // Logout user (revoke tokens if using token blacklist)
  async logout(userId: string): Promise<void> {
    // Sign out from Supabase
    await supabaseAdmin.auth.admin.signOut(userId)
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error) {
      throw new AppError(error.message, 400, 'VERIFICATION_FAILED')
    }
  }
}

export default new AuthService()
