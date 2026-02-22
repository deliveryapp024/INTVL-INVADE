import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { challengesApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Search, Plus, Trophy, Calendar, Users, Target, Edit2, Trash2, Play, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import { format } from 'date-fns'

interface Challenge {
  id: string
  title: string
  description: string
  type: 'distance' | 'runs' | 'zones' | 'time'
  goal: number
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  participants_count: number
  completed_count: number
  coins_reward: number
  xp_reward: number
  badge_url?: string
  created_at: string
}

const statusColors = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500'
}

const typeIcons = {
  distance: Target,
  runs: Trophy,
  zones: Trophy,
  time: Calendar
}

export default function ChallengesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['challenges', search, statusFilter],
    queryFn: () => challengesApi.getChallenges({ search, status: statusFilter }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => challengesApi.deleteChallenge(id),
    onSuccess: () => {
      toast.success('Challenge deleted')
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    },
    onError: () => toast.error('Failed to delete challenge')
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      challengesApi.updateChallenge(id, { status }),
    onSuccess: () => {
      toast.success('Challenge status updated')
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
    }
  })

  const challenges = Array.isArray(data?.data?.challenges) ? data.data.challenges : []

  const stats = [
    { label: 'Active', value: challenges.filter((c: Challenge) => c.status === 'active').length, color: 'text-green-500' },
    { label: 'Draft', value: challenges.filter((c: Challenge) => c.status === 'draft').length, color: 'text-gray-500' },
    { label: 'Completed', value: challenges.filter((c: Challenge) => c.status === 'completed').length, color: 'text-blue-500' },
    { label: 'Total Participants', value: challenges.reduce((sum: number, c: Challenge) => sum + c.participants_count, 0), color: 'text-primary' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Challenges</h1>
          <p className="mt-1 text-muted-foreground">Create and manage running challenges</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <CreateChallengeForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {isLoading ? '-' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search challenges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : challenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No challenges found</p>
          </div>
        ) : (
          challenges.map((challenge: Challenge) => {
            const Icon = typeIcons[challenge.type] || Trophy
            const progress = challenge.participants_count > 0
              ? (challenge.completed_count / challenge.participants_count) * 100
              : 0
            
            return (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Icon & Status */}
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${statusColors[challenge.status]} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="lg:hidden">
                        <Badge className={statusColors[challenge.status]}>
                          {challenge.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Badge className={`hidden lg:flex ${statusColors[challenge.status]}`}>
                          {challenge.status}
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{challenge.goal.toLocaleString()} {challenge.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participants_count} participants</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {challenge.completed_count} of {challenge.participants_count} completed
                        </p>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="font-semibold">{challenge.coins_reward}</span>
                          <span className="text-xs">coins</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-500">
                          <span className="font-semibold">{challenge.xp_reward}</span>
                          <span className="text-xs">XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col gap-2">
                      {challenge.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => updateStatusMutation.mutate({ id: challenge.id, status: 'active' })}
                        >
                          <Play className="w-4 h-4" />
                          Start
                        </Button>
                      )}
                      {challenge.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => updateStatusMutation.mutate({ id: challenge.id, status: 'completed' })}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(challenge.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Create Challenge Form
function CreateChallengeForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'distance',
    goal: 0,
    start_date: '',
    end_date: '',
    coins_reward: 0,
    xp_reward: 0
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => challengesApi.createChallenge(data),
    onSuccess: () => {
      toast.success('Challenge created')
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      onSuccess()
    },
    onError: () => toast.error('Failed to create challenge')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Weekend Warrior"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Run 10km this weekend"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance (km)</SelectItem>
              <SelectItem value="runs">Number of Runs</SelectItem>
              <SelectItem value="zones">Zones Captured</SelectItem>
              <SelectItem value="time">Time (minutes)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Goal</label>
          <Input
            type="number"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
            placeholder="e.g., 10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Coins Reward</label>
          <Input
            type="number"
            value={formData.coins_reward}
            onChange={(e) => setFormData({ ...formData, coins_reward: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">XP Reward</label>
          <Input
            type="number"
            value={formData.xp_reward}
            onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Challenge'}
      </Button>
    </form>
  )
}
