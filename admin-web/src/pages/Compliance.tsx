import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complianceApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Shield, Download, Trash2, Clock, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('exports')
  const queryClient = useQueryClient()

  const { data: exportJobs, isLoading: exportsLoading } = useQuery({
    queryKey: ['compliance-exports'],
    queryFn: () => complianceApi.getExportJobs().then(res => res.data)
  })

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['retention-policies'],
    queryFn: () => complianceApi.getRetentionPolicies().then(res => res.data)
  })

  const { data: stats } = useQuery({
    queryKey: ['compliance-stats'],
    queryFn: () => complianceApi.getStats().then(res => res.data)
  })

  const createExportMutation = useMutation({
    mutationFn: (userId: string) => complianceApi.createExportJob(userId),
    onSuccess: () => {
      toast.success('Export job created')
      queryClient.invalidateQueries({ queryKey: ['compliance-exports'] })
    }
  })

  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => complianceApi.createRetentionPolicy(data),
    onSuccess: () => {
      toast.success('Retention policy created')
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] })
    }
  })

  const requestExport = () => {
    const userId = window.prompt('Enter user_id to export data for (UUID):')
    if (!userId) return
    createExportMutation.mutate(userId)
  }

  const addPolicy = () => {
    const name = window.prompt('Policy name:')
    if (!name) return
    const entity = window.prompt('Entity (e.g. run_coordinates, analytics_events):')
    if (!entity) return
    const daysStr = window.prompt('Retention days (number):', '90')
    const retention_days = Number(daysStr)
    if (!Number.isFinite(retention_days) || retention_days <= 0) {
      toast.error('Invalid retention days')
      return
    }
    const action = window.prompt('Action (delete|anonymize):', 'delete') || 'delete'
    createPolicyMutation.mutate({ name, entity, retention_days, action })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance & GDPR</h1>
          <p className="mt-1 text-gray-600">Data privacy, exports, and retention policies</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary flex items-center"
            onClick={requestExport}
            disabled={createExportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Request Export
          </button>
          <button
            className="btn-primary flex items-center"
            onClick={addPolicy}
            disabled={createPolicyMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Exports</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.exports?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Exports</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.exports?.requested || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Retention Policies</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.retention?.policies || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rows Cleaned</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.retention?.total_rows_affected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b mb-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('exports')}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === 'exports'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              Data Exports
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              className={`pb-4 text-sm font-medium border-b-2 ${
                activeTab === 'policies'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              Retention Policies
            </button>
          </nav>
        </div>

        {activeTab === 'exports' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Requested By</th>
                  <th className="table-header">Created</th>
                  <th className="table-header">Expires</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exportsLoading ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8">
                      Loading...
                    </td>
                  </tr>
                ) : exportJobs?.jobs?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                      No export jobs yet
                    </td>
                  </tr>
                ) : (
                  exportJobs?.jobs?.map((job: any) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">{job.users?.name}</div>
                        <div className="text-sm text-gray-500">{job.users?.email}</div>
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'ready' ? 'bg-green-100 text-green-800' :
                          job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="table-cell">{job.requester?.email}</td>
                      <td className="table-cell">
                        {format(new Date(job.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="table-cell">
                        {job.expires_at ? format(new Date(job.expires_at), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="table-cell">
                        {job.status === 'ready' && job.file_url && (
                          <a
                            href={job.file_url}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Entity</th>
                  <th className="table-header">Retention</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {policiesLoading ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8">
                      Loading...
                    </td>
                  </tr>
                ) : policies?.policies?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                      No retention policies configured
                    </td>
                  </tr>
                ) : (
                  policies?.policies?.map((policy: any) => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{policy.name}</td>
                      <td className="table-cell">{policy.entity}</td>
                      <td className="table-cell">{policy.retention_days} days</td>
                      <td className="table-cell capitalize">{policy.action}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          policy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {policy.last_run_at 
                          ? format(new Date(policy.last_run_at), 'MMM d, yyyy')
                          : 'Never'
                        }
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
