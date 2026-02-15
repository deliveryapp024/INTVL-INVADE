import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complianceApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Shield, Download, Trash2, Clock, Plus, Database, FileArchive, Settings } from 'lucide-react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'warning' | 'success' => {
    switch (status) {
      case 'ready':
        return 'success'
      case 'processing':
        return 'primary'
      case 'requested':
        return 'warning'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance & GDPR</h1>
          <p className="mt-1 text-muted-foreground">Data privacy, exports, and retention policies</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={requestExport}
            disabled={createExportMutation.isPending}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Request Export
          </Button>
          <Button
            onClick={addPolicy}
            disabled={createPolicyMutation.isPending}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data Exports</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.exports?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Exports</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.exports?.requested || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retention Policies</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.retention?.policies || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <Trash2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rows Cleaned</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-20" /> : stats?.retention?.total_rows_affected || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="glass-card card-hover">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="exports" className="gap-2">
                <FileArchive className="w-4 h-4" />
                Data Exports
              </TabsTrigger>
              <TabsTrigger value="policies" className="gap-2">
                <Settings className="w-4 h-4" />
                Retention Policies
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="exports" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Requested By</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Expires</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : exportJobs?.jobs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No export jobs yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      exportJobs?.jobs?.map((job: any) => (
                        <TableRow key={job.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {job.users?.name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{job.users?.name}</div>
                                <div className="text-sm text-muted-foreground">{job.users?.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(job.status)} className="capitalize">
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{job.requester?.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(job.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {job.expires_at ? format(new Date(job.expires_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {job.status === 'ready' && job.file_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                asChild
                              >
                                <a href={job.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Entity</TableHead>
                      <TableHead className="font-semibold">Retention</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Last Run</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policiesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : policies?.policies?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No retention policies configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      policies?.policies?.map((policy: any) => (
                        <TableRow key={policy.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-primary" />
                              {policy.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{policy.entity}</TableCell>
                          <TableCell>
                            <span className="metric-value text-base">{policy.retention_days}</span>
                            <span className="text-muted-foreground text-sm"> days</span>
                          </TableCell>
                          <TableCell className="capitalize">{policy.action}</TableCell>
                          <TableCell>
                            <Badge variant={policy.enabled ? 'success' : 'outline'}>
                              {policy.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {policy.last_run_at
                              ? format(new Date(policy.last_run_at), 'MMM d, yyyy')
                              : 'Never'
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
