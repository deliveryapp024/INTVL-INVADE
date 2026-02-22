import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementsApi } from '@/services/api'
import { toast } from 'react-hot-toast'
import { Search, Plus, Trophy, Edit2, Trash2, Target, Users, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'distance' | 'runs' | 'zones' | 'social' | 'special'
  requirement_type: 'total_distance' | 'total_runs' | 'zones_captured' | 'streak_days' | 'special'
  requirement_value: number
  coins_reward: number
  xp_reward: number
  is_hidden: boolean
  created_at: string
}

const categoryColors = {
  distance: 'bg-blue-500',
  runs: 'bg-green-500',
  zones: 'bg-purple-500',
  social: 'bg-pink-500',
  special: 'bg-yellow-500'
}

const categoryIcons = {
  distance: Target,
  runs: Zap,
  zones: Trophy,
  social: Users,
  special: Trophy
}

export default function AchievementsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', search, categoryFilter],
    queryFn: () => achievementsApi.getAchievements({ search, category: categoryFilter }).then(res => res.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => achievementsApi.deleteAchievement(id),
    onSuccess: () => {
      toast.success('Achievement deleted')
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: () => toast.error('Failed to delete achievement')
  })

  const achievements = Array.isArray(data?.data?.achievements) ? data.data.achievements : []

  const stats = [
    { label: 'Total Achievements', value: achievements.length, icon: Trophy },
    { label: 'Distance', value: achievements.filter((a: Achievement) => a.category === 'distance').length, icon: Target },
    { label: 'Runs', value: achievements.filter((a: Achievement) => a.category === 'runs').length, icon: Zap },
    { label: 'Zones', value: achievements.filter((a: Achievement) => a.category === 'zones').length, icon: Trophy },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          <p className="mt-1 text-muted-foreground">Manage game achievements and rewards</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Achievement</DialogTitle>
            </DialogHeader>
            <CreateAchievementForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{isLoading ? '-' : stat.value}</p>
                </div>
              </div>
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
                placeholder="Search achievements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="runs">Runs</SelectItem>
                <SelectItem value="zones">Zones</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : achievements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No achievements found</p>
          </div>
        ) : (
          achievements.map((achievement: Achievement) => {
            const Icon = categoryIcons[achievement.category] || Trophy
            return (
              <Card key={achievement.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${categoryColors[achievement.category] || 'bg-gray-500'} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(achievement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{achievement.category}</Badge>
                    {achievement.is_hidden && <Badge variant="outline">Hidden</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span>{achievement.requirement_value.toLocaleString()} {achievement.requirement_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="font-semibold">{achievement.coins_reward}</span>
                      <span className="text-xs">coins</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-500">
                      <span className="font-semibold">{achievement.xp_reward}</span>
                      <span className="text-xs">XP</span>
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

// Create Achievement Form Component
function CreateAchievementForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'distance',
    requirement_type: 'total_distance',
    requirement_value: 0,
    coins_reward: 0,
    xp_reward: 0,
    is_hidden: false
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => achievementsApi.createAchievement(data),
    onSuccess: () => {
      toast.success('Achievement created')
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      onSuccess()
    },
    onError: () => toast.error('Failed to create achievement')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Marathon Master"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Run a total of 42km"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="runs">Runs</SelectItem>
              <SelectItem value="zones">Zones</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Requirement Type</label>
          <Select
            value={formData.requirement_type}
            onValueChange={(v) => setFormData({ ...formData, requirement_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_distance">Total Distance</SelectItem>
              <SelectItem value="total_runs">Total Runs</SelectItem>
              <SelectItem value="zones_captured">Zones Captured</SelectItem>
              <SelectItem value="streak_days">Streak Days</SelectItem>
              <SelectItem value="special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Target Value</label>
          <Input
            type="number"
            value={formData.requirement_value}
            onChange={(e) => setFormData({ ...formData, requirement_value: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Coins</label>
          <Input
            type="number"
            value={formData.coins_reward}
            onChange={(e) => setFormData({ ...formData, coins_reward: parseInt(e.target.value) })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">XP</label>
          <Input
            type="number"
            value={formData.xp_reward}
            onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_hidden"
          checked={formData.is_hidden}
          onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
          className="rounded border-gray-300"
        />
        <label htmlFor="is_hidden" className="text-sm">Hidden Achievement</label>
      </div>
      
      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Achievement'}
      </Button>
    </form>
  )
}
