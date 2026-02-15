import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Bell, Send, CheckCircle, XCircle, Clock, RotateCcw, MessageSquare, FileText } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('jobs')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetType, setTargetType] = useState<'all' | 'segment' | 'specific'>('all')
  const [scheduledFor, setScheduledFor] = useState('')
  const queryClient = useQueryClient()

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['notification-jobs'],
    queryFn: () => notificationsApi.getJobs().then(res => res.data)
  })

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationsApi.getTemplates().then(res => res.data)
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: () =>
      notificationsApi.createJob({
        title,
        body,
        target_type: targetType,
        scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : undefined
      }),
    onSuccess: () => {
      toast.success('Notification created')
      setShowCreateModal(false)
      setTitle('')
      setBody('')
      setTargetType('all')
      setScheduledFor('')
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create notification')
    }
  })

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'warning' | 'success' => {
    switch (status) {
      case 'sent':
        return 'success'
      case 'scheduled':
        return 'warning'
      case 'failed':
        return 'destructive'
      case 'queued':
        return 'primary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Push Notifications</h1>
          <p className="mt-1 text-muted-foreground">Manage and send push notifications to users</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Send className="w-4 h-4" />
          Send Notification
        </Button>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="glass-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Create Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Time to run"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <textarea
                id="body"
                className="w-full min-h-[90px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target</Label>
                <Select value={targetType} onValueChange={((v: string) => setTargetType(v as 'all' | 'segment' | 'specific')) as (value: string) => void}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="segment">Segment</SelectItem>
                    <SelectItem value="specific">Specific users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
            </div>
            {(targetType === 'segment' || targetType === 'specific') && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                Segment and specific targeting UI isn't wired up yet; defaulting to "all" is recommended.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              disabled={!title || !body || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? 'Sending...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.jobs?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.jobs?.sent || 0}
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
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.jobs?.scheduled || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="metric-value">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.jobs?.failed || 0}
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
              <TabsTrigger value="jobs" className="gap-2">
                <Send className="w-4 h-4" />
                Notification Jobs
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FileText className="w-4 h-4" />
                Templates
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="jobs" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Target</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Sent/Requested</TableHead>
                      <TableHead className="font-semibold">Scheduled</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : jobs?.jobs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No notifications yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs?.jobs?.map((job: any) => (
                        <TableRow key={job.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <MessageSquare className="w-4 h-4 text-primary mt-1" />
                              <div>
                                <div className="font-medium text-foreground">{job.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-xs">{job.body}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize text-muted-foreground">{job.target_type}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(job.status)} className="capitalize">
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="metric-value text-base">{job.sent_count}</span>
                            <span className="text-muted-foreground"> / {job.requested_count}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {job.scheduled_for ? format(new Date(job.scheduled_for), 'MMM d, HH:mm') : 'Immediate'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              {job.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => retryMutation.mutate(job.id)}
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </Button>
                              )}
                              {(job.status === 'scheduled' || job.status === 'queued') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => cancelMutation.mutate(job.id)}
                                >
                                  <XCircle className="w-4 h-4" />
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
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Title Template</TableHead>
                      <TableHead className="font-semibold">Body Template</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templatesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : templates?.templates?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          No templates yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates?.templates?.map((template: any) => (
                        <TableRow key={template.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.title_template}</TableCell>
                          <TableCell className="truncate max-w-xs">{template.body_template}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(template.created_at), 'MMM d, yyyy')}
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
