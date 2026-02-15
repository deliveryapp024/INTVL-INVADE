import { useState } from 'react'
import { useAuthStore } from '@/hooks/useAuth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'
import { User, Mail, Shield, Calendar, Activity, Trophy, Zap, Edit3, Camera, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || ''
  })

  // Fetch fresh user data (background refresh)
  useQuery({
    queryKey: ['current-user'],
    queryFn: () => authApi.me().then(res => res.data.data),
    enabled: !!user
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (response) => {
      // Update local storage with new user data
      const updatedUser = response.data.data
      setAuth(updatedUser, useAuthStore.getState().token!)
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update profile')
    }
  })

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || ''
    })
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-primary text-primary-foreground'
      case 'admin':
        return 'bg-secondary text-secondary-foreground'
      case 'support':
        return 'bg-success text-success-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">My Profile</h1>
          <p className="mt-1 text-muted-foreground">Manage your account information and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-primary-dark">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 glass-card card-hover">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
                <AvatarImage src={user?.avatar_url || ''} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-secondary text-white font-bold">
                  {getInitials(user?.name || 'A')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary-dark"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            
            <Badge className={`mt-3 ${getRoleColor(user?.role || 'user')}`}>
              <Shield className="w-3 h-3 mr-1" />
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Badge>

            <Separator className="my-6" />

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="ml-auto">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={user?.status === 'active' ? 'success' : 'destructive'} className="ml-auto">
                  {user?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Level:</span>
                <span className="ml-auto font-semibold">{user?.level || 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Account Details
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="lg:col-span-3 glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Activity Stats
            </CardTitle>
            <CardDescription>Your performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold font-display text-primary">{user?.total_runs || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Runs</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold font-display text-secondary">{user?.total_distance || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Distance (km)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold font-display text-success">{user?.streak_days || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Day Streak</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold font-display text-warning">{user?.coins || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Coins Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="lg:col-span-3 glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <h4 className="font-semibold">Password</h4>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <h4 className="font-semibold">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
