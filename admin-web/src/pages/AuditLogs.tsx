import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/services/api'
import { FileText, Search, Filter, User, Calendar, Activity } from 'lucide-react'
import { format } from 'date-fns'

const actionColors: Record<string, string> = {
  'USER_VIEW': 'bg-blue-100 text-blue-800',
  'USER_UPDATE': 'bg-yellow-100 text-yellow-800',
  'USER_SUSPEND': 'bg-red-100 text-red-800',
  'USER_UNSUSPEND': 'bg-green-100 text-green-800',
  'USER_ANONYMIZE': 'bg-purple-100 text-purple-800',
  'NOTIFICATION_SEND': 'bg-blue-100 text-blue-800',
  'NOTIFICATION_JOB_CREATED': 'bg-green-100 text-green-800',
  'NOTIFICATION_JOB_CANCELLED': 'bg-orange-100 text-orange-800',
  'RETENTION_RUN': 'bg-gray-100 text-gray-800',
  'ROLE_CHANGE': 'bg-purple-100 text-purple-800',
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, actionFilter],
    queryFn: () => auditApi.getLogs({ page, limit: 50, search, action: actionFilter }).then(res => res.data)
  })

  const { data: stats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditApi.getStats().then(res => res.data)
  })

  const logs = data?.logs || []
  const pagination = data?.pagination

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-gray-600">Track all admin actions for compliance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_actions || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.unique_admins || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.today_actions || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entity Types</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.entity_types || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Actions</option>
            <option value="USER_VIEW">View User</option>
            <option value="USER_UPDATE">Update User</option>
            <option value="USER_SUSPEND">Suspend User</option>
            <option value="USER_UNSUSPEND">Unsuspend User</option>
            <option value="NOTIFICATION_SEND">Send Notification</option>
            <option value="RETENTION_RUN">Retention Run</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Time</th>
                <th className="table-header">Admin</th>
                <th className="table-header">Action</th>
                <th className="table-header">Entity</th>
                <th className="table-header">Details</th>
                <th className="table-header">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-8 text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="table-cell whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900">{log.actor_user?.email}</div>
                      <div className="text-xs text-gray-500">{log.actor_role}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        actionColors[log.action] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">{log.entity_type}</div>
                      {log.entity_id && (
                        <div className="text-xs text-gray-500 truncate max-w-[100px]">{log.entity_id}</div>
                      )}
                    </td>
                    <td className="table-cell">
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, pagination.total)} of {pagination.total} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 50 >= pagination.total}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
