import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import authService, { SignUpData, SignInData } from '../services/authService'
import { User } from '../types/supabase'

interface AuthContextData {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (data: SignUpData) => Promise<{ error?: Error }>
  signIn: (data: SignInData) => Promise<{ error?: Error }>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkSession()

    // Subscribe to auth state changes
    const { data: subscription } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = await authService.getCurrentUser()
        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      const { user, error } = await authService.getCurrentUser()
      if (!error && user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Session check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (data: SignUpData) => {
    setIsLoading(true)
    try {
      const { user, error } = await authService.signUp(data)
      if (error) throw error
      if (user) setUser(user)
      return {}
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    setIsLoading(true)
    try {
      const { user, error } = await authService.signIn(data)
      if (error) throw error
      if (user) setUser(user)
      return {}
    } catch (error) {
      return { error: error as Error }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    try {
      const { user: updatedUser, error } = await authService.updateProfile(user.id, updates)
      if (error) throw error
      if (updatedUser) setUser(updatedUser)
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const { user: refreshedUser } = await authService.getCurrentUser()
      if (refreshedUser) setUser(refreshedUser)
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  const value: AuthContextData = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
