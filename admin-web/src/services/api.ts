import axios from 'axios'
import { useAuthStore } from '@/hooks/useAuth'
import type { User } from '../types'
import { toast } from 'react-hot-toast'

function resolveBaseUrl() {
  const configured = ((import.meta as any).env?.VITE_API_URL as string | undefined) || ''

  // Default to deployed backend. This keeps prod working even if .env contains localhost.
  const prodDefault = 'https://intvl-invade-backend.onrender.com/api/v1'

  if (typeof window === 'undefined') return configured || prodDefault

  const hostname = window.location.hostname
  const runningLocally = hostname === 'localhost' || hostname === '127.0.0.1'
  const isLocalApi = configured.includes('localhost') || configured.includes('127.0.0.1')

  // If we are not on localhost but the configured API points to localhost, ignore it.
  if (!runningLocally && isLocalApi) return prodDefault

  return configured || prodDefault
}

const api = axios.create({
  baseURL: resolveBaseUrl()
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const message = error.response?.data?.error?.message || 'Session expired'
      // Give a visible hint before redirecting.
      toast.error(`${message}${url ? ` (${url})` : ''}`)
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  me: () => api.get('/auth/me'),

  updateProfile: (data: any) =>
    api.patch('/auth/me', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Users API
export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get('/admin/users', { 
      params: {
        offset: params?.page ? (params.page - 1) * (params.limit || 20) : 0,
        limit: params?.limit || 20,
        query: params?.search,
        role: params?.role,
        status: params?.status
      }
    }),
  
  getUser: (id: string) =>
    api.get(`/admin/users/${id}`),
  
  updateUser: (id: string, data: Partial<User>) =>
    api.put(`/admin/users/${id}`, data),
  
  suspendUser: (id: string) =>
    api.post(`/admin/users/${id}/suspend`),
  
  unsuspendUser: (id: string) =>
    api.post(`/admin/users/${id}/unsuspend`),
  
  anonymizeUser: (id: string) =>
    api.post(`/admin/users/${id}/anonymize`)
}

// Runs API
export const runsApi = {
  getRuns: (params?: { page?: number; limit?: number; user_id?: string; search?: string }) =>
    api.get('/admin/runs', { 
      params: {
        offset: params?.page ? (params.page - 1) * (params.limit || 20) : 0,
        limit: params?.limit || 20,
        userId: params?.user_id,
        query: params?.search
      }
    }),
  
  getRun: (id: string) =>
    api.get(`/admin/runs/${id}`),
  
  deleteRun: (id: string) =>
    api.delete(`/admin/runs/${id}`)
}

// Notifications API
export const notificationsApi = {
  getTemplates: () =>
    api.get('/admin/notifications/templates'),
  
  createTemplate: (data: any) =>
    api.post('/admin/notifications/templates', data),
  
  updateTemplate: (id: string, data: any) =>
    api.put(`/admin/notifications/templates/${id}`, data),
  
  deleteTemplate: (id: string) =>
    api.delete(`/admin/notifications/templates/${id}`),
  
  getJobs: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/notifications/jobs', { params }),
  
  getJob: (id: string) =>
    api.get(`/admin/notifications/jobs/${id}`),
  
  createJob: (data: any) =>
    api.post('/admin/notifications/jobs', data),
  
  cancelJob: (id: string) =>
    api.post(`/admin/notifications/jobs/${id}/cancel`),
  
  retryJob: (id: string) =>
    api.post(`/admin/notifications/jobs/${id}/retry`),
  
  getStats: () =>
    api.get('/admin/notifications/stats')
}

// Compliance API
export const complianceApi = {
  getExportJobs: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/compliance/export-jobs', { params }),
  
  createExportJob: (userId: string) =>
    api.post('/admin/compliance/export-jobs', { user_id: userId }),
  
  getRetentionPolicies: () =>
    api.get('/admin/compliance/retention-policies'),
  
  createRetentionPolicy: (data: any) =>
    api.post('/admin/compliance/retention-policies', data),
  
  updateRetentionPolicy: (id: string, data: any) =>
    api.put(`/admin/compliance/retention-policies/${id}`, data),
  
  deleteRetentionPolicy: (id: string) =>
    api.delete(`/admin/compliance/retention-policies/${id}`),
  
  getStats: () =>
    api.get('/admin/compliance/stats')
}

// Audit API
export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; action?: string; entity_type?: string; search?: string }) =>
    api.get('/admin/audit-logs', { params }),
  
  getStats: () =>
    api.get('/admin/audit-logs/stats')
}

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/admin/stats'),
  getActivity: () => api.get('/admin/activity')
}

// Zones API
export const zonesApi = {
  getZones: (params?: { search?: string; sort?: string }) =>
    api.get('/zones', { params }),
  
  getZone: (id: string) =>
    api.get(`/zones/${id}`),
  
  createZone: (data: any) =>
    api.post('/zones', data),
  
  updateZone: (id: string, data: any) =>
    api.patch(`/zones/${id}`, data),
  
  deleteZone: (id: string) =>
    api.delete(`/zones/${id}`)
}

// Webhooks API
export const webhooksApi = {
  getWebhooks: () =>
    api.get('/webhooks'),
  
  getWebhook: (id: string) =>
    api.get(`/webhooks/${id}`),
  
  createWebhook: (data: any) =>
    api.post('/webhooks', data),
  
  updateWebhook: (id: string, data: any) =>
    api.patch(`/webhooks/${id}`, data),
  
  deleteWebhook: (id: string) =>
    api.delete(`/webhooks/${id}`),
  
  getDeliveryLogs: (webhookId: string) =>
    api.get(`/webhooks/${webhookId}/deliveries`),
  
  testWebhook: (id: string) =>
    api.post(`/webhooks/${id}/test`)
}

// Challenges API
export const challengesApi = {
  getChallenges: (params?: { search?: string; status?: string }) =>
    api.get('/challenges/all', { params }),
  
  getChallenge: (id: string) =>
    api.get(`/challenges/${id}`),
  
  createChallenge: (data: any) =>
    api.post('/challenges', data),
  
  updateChallenge: (id: string, data: any) =>
    api.patch(`/challenges/${id}`, data),
  
  deleteChallenge: (id: string) =>
    api.delete(`/challenges/${id}`),
  
  getLeaderboard: (id: string) =>
    api.get(`/challenges/${id}/leaderboard`)
}

// Achievements API
export const achievementsApi = {
  getAchievements: (params?: { search?: string; category?: string }) =>
    api.get('/achievements', { params }),
  
  getAchievement: (id: string) =>
    api.get(`/achievements/${id}`),
  
  createAchievement: (data: any) =>
    api.post('/achievements', data),
  
  updateAchievement: (id: string, data: any) =>
    api.patch(`/achievements/${id}`, data),
  
  deleteAchievement: (id: string) =>
    api.delete(`/achievements/${id}`),
  
  getStats: () =>
    api.get('/achievements/stats')
}

// Settings API
export const settingsApi = {
  getSettings: () =>
    api.get('/settings'),

  updateSettings: (settings: any) =>
    api.patch('/settings', settings),

  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/settings/notifications', { params }),

  getUnreadCount: () =>
    api.get('/settings/notifications/unread-count'),

  markNotificationAsRead: (id: string) =>
    api.patch(`/settings/notifications/${id}/read`),

  markAllNotificationsAsRead: () =>
    api.post('/settings/notifications/read-all'),

  testNotification: () =>
    api.post('/settings/notifications/test')
}
