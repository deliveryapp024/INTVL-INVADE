import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { 
  Users, 
  Activity, 
  Target, 
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType, 
  subtitle,
  isLoading 
}: { 
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="skeleton-shimmer h-24 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden card-hover">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="metric-value mt-2 text-foreground">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        {change && (
          <div className="flex items-center gap-2 mt-4">
            <Badge 
              variant="secondary" 
              className={`
                ${changeType === 'positive' ? 'bg-success/10 text-success border-0' : ''}
                ${changeType === 'negative' ? 'bg-error/10 text-error border-0' : ''}
                ${changeType === 'neutral' ? 'bg-muted text-muted-foreground border-0' : ''}
              `}
            >
              {changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
              {changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </Badge>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Live Indicator Component
function LiveIndicator({ lastUpdated }: { lastUpdated: Date }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getTimeText = () => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
      </span>
      <span>Live</span>
      <span className="text-muted-foreground/60">•</span>
      <span>Updated {getTimeText()}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      setLastUpdated(new Date());
      return response.data;
    },
    refetchInterval: 30000, // 30 seconds
  });

  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      const response = await dashboardApi.getActivity();
      return response.data;
    },
    refetchInterval: 30000,
  });

  const activities = activityData?.data || [];

  const metrics = [
    { 
      title: 'Total Users', 
      value: stats?.data?.totalUsers?.toLocaleString() || '0',
      icon: Users,
      change: '+12.5%',
      changeType: 'positive' as const,
      subtitle: 'Active runners'
    },
    { 
      title: 'Active Runs', 
      value: stats?.data?.activeRuns?.toLocaleString() || '0',
      icon: Activity,
      change: '+8.2%',
      changeType: 'positive' as const,
      subtitle: 'Currently running'
    },
    { 
      title: 'Territories', 
      value: stats?.data?.territories?.toLocaleString() || '0',
      icon: Target,
      change: '+23.1%',
      changeType: 'positive' as const,
      subtitle: 'Zones captured'
    },
    { 
      title: 'Total Distance', 
      value: `${(stats?.data?.totalDistance || 0).toLocaleString()} km`,
      icon: Zap,
      change: '+15.3%',
      changeType: 'positive' as const,
      subtitle: 'All time'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Commander'}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your territory today.</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator lastUpdated={lastUpdated} />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={metric.title} className={`stagger-${index + 1}`}>
            <MetricCard {...metric} isLoading={isLoading} />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Activity Overview</CardTitle>
              <p className="text-sm text-muted-foreground">User activity over the last 30 days</p>
            </div>
            <Badge variant="secondary">Last 30 days</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Charts will appear as data grows</p>
              <p className="text-xs text-muted-foreground/60 mt-1">We will wire Tremor charts to analytics endpoints</p>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">API Response</span>
                  <span className="font-medium text-success">24ms</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Database</span>
                  <span className="font-medium text-success">12ms</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Real-time</span>
                  <span className="font-medium text-success">Active</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-between text-sm h-auto py-2">
                  View All Users
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between text-sm h-auto py-2">
                  Send Notification
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between text-sm h-auto py-2">
                  Export Reports
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest actions across the platform</p>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isActivityLoading ? (
              // Loading skeletons
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                    {activity.actor_avatar_url ? (
                      <img 
                        src={activity.actor_avatar_url} 
                        alt={activity.actor_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action_description}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.actor_email} • {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-0 shrink-0">
                    {activity.action_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
