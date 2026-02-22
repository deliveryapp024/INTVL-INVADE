import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Search, Filter, UserX, UserCheck, Edit3, Users, Shield, Crown, HeadphonesIcon } from 'lucide-react'
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

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () => usersApi.getUsers({ page, limit: 20, search, role: roleFilter, status: statusFilter }).then(res => {
      console.log('Users API response:', res.data)
      return res.data
    })
  })

  // Debug logging
  console.log('Users data:', data)
  console.log('Users error:', error)

  const suspendMutation = useMutation({
    mutationFn: (id: string) => usersApi.suspendUser(id),
    onSuccess: () => {
      toast.success('User suspended')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => toast.error('Failed to suspend user')
  })

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => usersApi.unsuspendUser(id),
    onSuccess: () => {
      toast.success('User unsuspended')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => toast.error('Failed to unsuspend user')
  })

  const users = Array.isArray(data?.data?.users) ? data.data.users : []
  const pagination = data?.meta

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="w-3 h-3 mr-1" />
      case 'admin':
        return <Shield className="w-3 h-3 mr-1" />
      case 'support':
        return <HeadphonesIcon className="w-3 h-3 mr-1" />
      default:
        return <Users className="w-3 h-3 mr-1" />
    }
  }

  const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'warning' | 'success' => {
    switch (role) {
      case 'superadmin':
        return 'primary'
      case 'admin':
        return 'secondary'
      case 'support':
        return 'success'
      default:
        return 'outline'
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'warning' | 'success' => {
    switch (status) {
      case 'active':
        return 'success'
      case 'suspended':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="mt-1 text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Export
        </Button>
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
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card card-hover overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Runs</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="text-sm font-semibold text-primary">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(user.role)} className="capitalize">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)} className="capitalize">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="metric-value text-lg">{user.level}</span>
                    </TableCell>
                    <TableCell>
                      <span className="metric-value text-lg">{user.total_runs}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => suspendMutation.mutate(user.id)}
                            disabled={suspendMutation.isPending}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-success hover:bg-success/10"
                            onClick={() => unsuspendMutation.mutate(user.id)}
                            disabled={unsuspendMutation.isPending}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * 20, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> users
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
                disabled={!pagination || page * 20 >= pagination.total}
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
