import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/services/api'
import { Users, Activity, Bell, Shield } from 'lucide-react'

const statsCards = [
  { name: 'Total Users', icon: Users, key: 'users' },
  { name: 'Total Runs', icon: Activity, key: 'runs' },
  { name: 'Notifications Sent', icon: Bell, key: 'notifications' },
  { name: 'Compliance Exports', icon: Shield, key: 'compliance' },
]

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then(res => res.data)
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-600">Overview of your application</p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <div key={card.name} className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <card.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '-' : stats?.[card.key] || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity feed coming soon...</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Status</span>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Notifications Queue</span>
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
