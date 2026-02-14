import axios from 'axios'
import { useAuthStore } from '@/hooks/useAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1'
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
  
  me: () => api.get('/auth/me')
}

// Users API
export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/admin/users', { params }),
  
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
  getRuns: (params?: { page?: number; limit?: number; user_id?: string }) =>
    api.get('/admin/runs', { params }),
  
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
  getLogs: (params?: { page?: number; limit?: number; action?: string; entity_type?: string }) =>
    api.get('/admin/audit-logs', { params }),
  
  getStats: () =>
    api.get('/admin/audit-logs/stats')
}

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard/stats')
}
