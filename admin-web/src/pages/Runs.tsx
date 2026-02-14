import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { runsApi } from '@/services/api'
import { Search, MapPin, Clock, Activity, Route } from 'lucide-react'
import { format } from 'date-fns'

export default function RunsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['runs', page, search],
    queryFn: () => runsApi.getRuns({ page, limit: 20, search }).then(res => res.data)
  })

  const runs = data?.runs || []
  const pagination = data?.pagination

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Runs Management</h1>
          <p className="mt-1 text-gray-600">View and manage user running activities</p>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search runs by user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Runs</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats?.total || '-'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Route className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats?.distance ? `${(data.stats.distance / 1000).toFixed(1)} km` : '-'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats?.duration ? `${Math.floor(data.stats.duration / 3600)}h` : '-'}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Zones Captured</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats?.zones || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Runs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Distance</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Avg Speed</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-gray-500">
                    No runs found
                  </td>
                </tr>
              ) : (
                runs.map((run: any) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900">{run.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{run.user?.email}</div>
                    </td>
                    <td className="table-cell">
                      {(run.distance / 1000).toFixed(2)} km
                    </td>
                    <td className="table-cell">
                      {Math.floor(run.duration / 60)}m {run.duration % 60}s
                    </td>
                    <td className="table-cell">
                      {run.average_speed?.toFixed(1)} km/h
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        run.status === 'completed' ? 'bg-green-100 text-green-800' :
                        run.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        run.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {format(new Date(run.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="table-cell">
                      <button className="text-primary-600 hover:text-primary-800 font-medium">
                        View
                      </button>
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
              Page {page} of {Math.ceil(pagination.total / 20)}
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
                disabled={page * 20 >= pagination.total}
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
