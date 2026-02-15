import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  username?: string
  role: 'user' | 'support' | 'admin' | 'superadmin'
  status?: 'active' | 'suspended' | 'pii_anonymized'
  avatar_url?: string | null
  level?: number
  total_runs?: number
  total_distance?: number
  streak_days?: number
  coins?: number
  created_at?: string
  updated_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false })
    }),
    {
      name: 'invade-admin-auth'
    }
  )
)
