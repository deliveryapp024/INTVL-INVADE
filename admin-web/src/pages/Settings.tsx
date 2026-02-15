import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Database, 
  Save,
  Mail,
  Smartphone,
  Eye,
  Lock
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    
    // Privacy
    profileVisible: true,
    activityVisible: false,
    
    // Display
    compactMode: false,
    autoRefresh: true,
    
    // Security
    loginAlerts: true,
    suspiciousActivityAlerts: true
  })

  // Fetch settings from API
  const { data: settingsData } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => settingsApi.getSettings().then(res => res.data.data)
  })

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (newSettings: any) => settingsApi.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      toast.success('Settings saved successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to save settings')
    }
  })

  // Initialize settings from API data
  useEffect(() => {
    if (settingsData) {
      setSettings({
        emailNotifications: settingsData.email_notifications ?? true,
        pushNotifications: settingsData.push_notifications ?? true,
        marketingEmails: settingsData.marketing_emails ?? false,
        profileVisible: settingsData.profile_visible ?? true,
        activityVisible: settingsData.activity_visible ?? false,
        compactMode: settingsData.compact_mode ?? false,
        autoRefresh: settingsData.auto_refresh ?? true,
        loginAlerts: settingsData.login_alerts ?? true,
        suspiciousActivityAlerts: settingsData.suspicious_activity_alerts ?? true
      })
    }
  }, [settingsData])

  const handleSave = () => {
    const apiSettings = {
      email_notifications: settings.emailNotifications,
      push_notifications: settings.pushNotifications,
      marketing_emails: settings.marketingEmails,
      profile_visible: settings.profileVisible,
      activity_visible: settings.activityVisible,
      compact_mode: settings.compactMode,
      auto_refresh: settings.autoRefresh,
      login_alerts: settings.loginAlerts,
      suspicious_activity_alerts: settings.suspiciousActivityAlerts
    }
    updateMutation.mutate(apiSettings)
  }

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    checked, 
    onChange 
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    checked: boolean, 
    onChange: (checked: boolean) => void 
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange}
      />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your preferences and account settings</p>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-primary to-primary-dark">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how the dashboard looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Moon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button 
                  variant={theme === 'system' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
              </div>
            </div>

            <SettingItem
              icon={Eye}
              title="Compact Mode"
              description="Reduce spacing and font sizes for more content"
              checked={settings.compactMode}
              onChange={(checked) => setSettings({ ...settings, compactMode: checked })}
            />

            <SettingItem
              icon={Database}
              title="Auto-refresh Data"
              description="Automatically refresh dashboard data every 30 seconds"
              checked={settings.autoRefresh}
              onChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
            />
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingItem
              icon={Mail}
              title="Email Notifications"
              description="Receive important updates via email"
              checked={settings.emailNotifications}
              onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />

            <SettingItem
              icon={Smartphone}
              title="Push Notifications"
              description="Get real-time alerts in your browser"
              checked={settings.pushNotifications}
              onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
            />

            <SettingItem
              icon={Bell}
              title="Marketing Emails"
              description="Receive news, tips, and promotional content"
              checked={settings.marketingEmails}
              onChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
            />
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacy
            </CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingItem
              icon={Eye}
              title="Profile Visibility"
              description="Make your profile visible to other users"
              checked={settings.profileVisible}
              onChange={(checked) => setSettings({ ...settings, profileVisible: checked })}
            />

            <SettingItem
              icon={Globe}
              title="Activity Visibility"
              description="Show your activity status to others"
              checked={settings.activityVisible}
              onChange={(checked) => setSettings({ ...settings, activityVisible: checked })}
            />
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass-card card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security Alerts
            </CardTitle>
            <CardDescription>Manage security notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingItem
              icon={Bell}
              title="Login Alerts"
              description="Get notified when someone logs into your account"
              checked={settings.loginAlerts}
              onChange={(checked) => setSettings({ ...settings, loginAlerts: checked })}
            />

            <SettingItem
              icon={Shield}
              title="Suspicious Activity"
              description="Alert me about unusual account activity"
              checked={settings.suspiciousActivityAlerts}
              onChange={(checked) => setSettings({ ...settings, suspiciousActivityAlerts: checked })}
            />
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="glass-card card-hover lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language and timezone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Language</Label>
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span>English (US)</span>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span>UTC (GMT+0)</span>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-card card-hover lg:col-span-2 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <h4 className="font-semibold text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
