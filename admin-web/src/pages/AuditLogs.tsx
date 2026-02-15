import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/services/api'
import { FileText, Search, User, Calendar, Activity, Shield, Eye, Edit, UserX, UserCheck, UserCog, Bell, Clock, RefreshCw, Lock } from 'lucide-react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const actionConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'USER_VIEW': { icon: <Eye className="w-3 h-3" />, color: 'bg-primary/10 text-primary border-primary/20', label: 'View User' },
  'USER_UPDATE': { icon: <Edit className="w-3 h-3" />, color: 'bg-warning/10 text-warning border-warning/20', label: 'Update User' },
  'USER_SUSPEND': { icon: <UserX className="w-3 h-3" />, color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Suspend User' },
  'USER_UNSUSPEND': { icon: <UserCheck className="w-3 h-3" />, color: 'bg-success/10 text-success border-success/20', label: 'Unsuspend User' },
  'USER_ANONYMIZE': { icon: <Lock className="w-3 h-3" />, color: 'bg-secondary/10 text-secondary border-secondary/20', label: 'Anonymize User' },
  'NOTIFICATION_SEND': { icon: <Bell className="w-3 h-3" />, color: 'bg-primary/10 text-primary border-primary/20', label: 'Send Notification' },
  'NOTIFICATION_JOB_CREATED': { icon: <Bell className="w-3 h-3" />, color: 'bg-success/10 text-success border-success/20', label: 'Create Notification' },
  'NOTIFICATION_JOB_CANCELLED': { icon: <Clock className="w-3 h-3" />, color: 'bg-warning/10 text-warning border-warning/20', label: 'Cancel Notification' },
  'RETENTION_RUN': { icon: <RefreshCw className="w-3 h-3" />, color: 'bg-muted text-muted-foreground border-border', label: 'Retention Run' },
  'ROLE_CHANGE': { icon: <UserCog className="w-3 h-3" />, color: 'bg-secondary/10 text-secondary border-secondary/20', label: 'Role Change' },
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, actionFilter],
    queryFn: () => auditApi.getLogs({ page, limit: 50, search, action: actionFilter }).then(res => res.data)
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: () => auditApi.getStats().then(res => res.data)
  })

  const logs = data?.logs || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="mt-1 text-muted-foreground">Track all admin actions for compliance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.total_actions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <User className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Admins</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.unique_admins || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Actions</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.today_actions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <FileText className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entity Types</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.entity_types || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card card-hover">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="USER_VIEW">View User</SelectItem>
                <SelectItem value="USER_UPDATE">Update User</SelectItem>
                <SelectItem value="USER_SUSPEND">Suspend User</SelectItem>
                <SelectItem value="USER_UNSUSPEND">Unsuspend User</SelectItem>
                <SelectItem value="NOTIFICATION_SEND">Send Notification</SelectItem>
                <SelectItem value="RETENTION_RUN">Retention Run</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="glass-card card-hover overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Admin</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Entity</TableHead>
                <TableHead className="font-semibold">Details</TableHead>
                <TableHead className="font-semibold">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-16 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => {
                  const actionInfo = actionConfig[log.action] || { icon: <Shield className="w-3 h-3" />, color: 'bg-muted text-muted-foreground border-border', label: log.action }
                  return (
                    <TableRow key={log.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {log.actor_user?.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{log.actor_user?.email}</div>
                            <div className="text-xs text-muted-foreground">{log.actor_role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${actionInfo.color}`}>
                          {actionInfo.icon}
                          {actionInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{log.entity_type}</div>
                        {log.entity_id && (
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{log.entity_id}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <pre className="text-xs text-muted-foreground bg-muted p-2 rounded-lg max-w-[200px] overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {log.ip_address}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{((page - 1) * 50) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 50, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * 50 >= pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
