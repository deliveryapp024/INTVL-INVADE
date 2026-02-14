import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Bell, Send, Calendar, Users, MessageSquare, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['notification-jobs'],
    queryFn: () => notificationsApi.getJobs().then(res => res.data)
  })

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsApi.getTemplates().then(res => res.data)
  })

  const { data: stats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationsApi.getStats().then(res => res.data)
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.cancelJob(id),
    onSuccess: () => {
      toast.success('Notification cancelled')
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] })
    }
  })

  const retryMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.retryJob(id),
    onSuccess: () => {
      toast.success('Notification queued for retry')
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] })
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
          <p className="mt-1 text-gray-600">Manage and send push notifications to users</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.jobs?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.jobs?.sent || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.jobs?.scheduled || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.jobs?.failed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b mb-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === 'jobs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              Notification Jobs
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === 'templates'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              Templates
            </button>
          </nav>
        </div>

        {activeTab === 'jobs' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Target</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Sent/Requested</th>
                  <th className="table-header">Scheduled</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobsLoading ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8">
                      Loading...
                    </td>
                  </tr>
                ) : jobs?.jobs?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                      No notifications yet
                    </td>
                  </tr>
                ) : (
                  jobs?.jobs?.map((job: any) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{job.body}</div>
                      </td>
                      <td className="table-cell">
                        <span className="capitalize">{job.target_type}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'sent' ? 'bg-green-100 text-green-800' :
                          job.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          job.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {job.sent_count} / {job.requested_count}
                      </td>
                      <td className="table-cell">
                        {job.scheduled_for ? format(new Date(job.scheduled_for), 'MMM d, HH:mm') : 'Immediate'}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          {job.status === 'failed' && (
                            <button
                              onClick={() => retryMutation.mutate(job.id)}
                              className="p-2 text-gray-600 hover:text-blue-600"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          {(job.status === 'scheduled' || job.status === 'queued') && (
                            <button
                              onClick={() => cancelMutation.mutate(job.id)}
                              className="p-2 text-gray-600 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Title Template</th>
                  <th className="table-header">Body Template</th>
                  <th className="table-header">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templatesLoading ? (
                  <tr>
                    <td colSpan={4} className="table-cell text-center py-8">
                      Loading...
                    </td>
                  </tr>
                ) : templates?.templates?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-cell text-center py-8 text-gray-500">
                      No templates yet
                    </td>
                  </tr>
                ) : (
                  templates?.templates?.map((template: any) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{template.name}</td>
                      <td className="table-cell">{template.title_template}</td>
                      <td className="table-cell truncate max-w-xs">{template.body_template}</td>
                      <td className="table-cell">
                        {format(new Date(template.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
