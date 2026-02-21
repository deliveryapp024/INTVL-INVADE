import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { webhooksApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Search, Plus, Webhook, CheckCircle, XCircle, Clock, RefreshCw, Send, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Webhook {
  id: string
  url: string
  events: string[]
  is_active: boolean
  secret?: string
  created_at: string
  last_delivered_at?: string
  delivery_count: number
  failure_count: number
}

interface DeliveryLog {
  id: string
  webhook_id: string
  event: string
  payload: any
  response_status: number
  response_body?: string
  error_message?: string
  delivered_at: string
}

const eventTypes = [
  { value: 'user.created', label: 'User Created' },
  { value: 'user.updated', label: 'User Updated' },
  { value: 'run.completed', label: 'Run Completed' },
  { value: 'zone.captured', label: 'Zone Captured' },
  { value: 'achievement.earned', label: 'Achievement Earned' },
  { value: 'challenge.completed', label: 'Challenge Completed' },
]

export default function WebhooksPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: webhooksData, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => webhooksApi.getWebhooks().then(res => res.data)
  })

  const { data: logsData } = useQuery({
    queryKey: ['webhook-logs', selectedWebhook],
    queryFn: () => webhooksApi.getDeliveryLogs(selectedWebhook!).then(res => res.data),
    enabled: !!selectedWebhook
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.deleteWebhook(id),
    onSuccess: () => {
      toast.success('Webhook deleted')
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      webhooksApi.updateWebhook(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    }
  })

  const webhooks = webhooksData?.data || []
  const logs = logsData?.data || []

  const stats = [
    { label: 'Active Webhooks', value: webhooks.filter((w: Webhook) => w.is_active).length, icon: Webhook },
    { label: 'Total Deliveries', value: webhooks.reduce((sum: number, w: Webhook) => sum + w.delivery_count, 0), icon: Send },
    { label: 'Failed Deliveries', value: webhooks.reduce((sum: number, w: Webhook) => sum + w.failure_count, 0), icon: XCircle },
    { label: 'Success Rate', value: webhooks.length > 0 ? Math.round((webhooks.reduce((sum: number, w: Webhook) => sum + w.delivery_count, 0) / Math.max(1, webhooks.reduce((sum: number, w: Webhook) => sum + w.delivery_count + w.failure_count, 0))) * 100) : 0, unit: '%', icon: CheckCircle },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Webhooks</h1>
          <p className="mt-1 text-muted-foreground">Manage webhook endpoints and view delivery logs</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
            </DialogHeader>
            <CreateWebhookForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '-' : stat.value}
                    {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No webhooks configured</p>
              </CardContent>
            </Card>
          ) : (
            webhooks.map((webhook: Webhook) => (
              <Card
                key={webhook.id}
                className={`cursor-pointer transition-shadow ${selectedWebhook === webhook.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => setSelectedWebhook(webhook.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{webhook.url}</p>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{webhook.delivery_count} deliveries</span>
                        {webhook.failure_count > 0 && (
                          <span className="text-destructive">{webhook.failure_count} failed</span>
                        )}
                        {webhook.last_delivered_at && (
                          <span>Last: {new Date(webhook.last_delivered_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMutation.mutate({ id: webhook.id, isActive: !webhook.is_active })
                        }}
                      >
                        {webhook.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMutation.mutate(webhook.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Delivery Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Delivery Logs</h2>
          {!selectedWebhook ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a webhook to view delivery logs</p>
              </CardContent>
            </Card>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No delivery logs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.map((log: DeliveryLog) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={log.response_status >= 200 && log.response_status < 300 ? 'default' : 'destructive'}>
                        {log.response_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.delivered_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{log.event}</p>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Create Webhook Form
function CreateWebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[],
    secret: ''
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => webhooksApi.createWebhook(data),
    onSuccess: () => {
      toast.success('Webhook created')
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      onSuccess()
    },
    onError: () => toast.error('Failed to create webhook')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium">Endpoint URL</label>
        <Input
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://your-app.com/webhook"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Events</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {eventTypes.map((event) => (
            <label
              key={event.value}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                formData.events.includes(event.value) ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.events.includes(event.value)}
                onChange={() => toggleEvent(event.value)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{event.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Secret (optional)</label>
        <Input
          type="password"
          value={formData.secret}
          onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
          placeholder="For HMAC signature verification"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending || formData.events.length === 0}>
        {createMutation.isPending ? 'Creating...' : 'Create Webhook'}
      </Button>
    </form>
  )
}
