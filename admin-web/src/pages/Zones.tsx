import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { zonesApi } from '@/services/api'
import { Search, MapPin, Crown, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Zone {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  radius: number
  h3_index: string
  total_captures: number
  current_owner_id?: string
  current_owner_name?: string
  current_owner_avatar?: string
  weekly_distance: number
  capture_count: number
  created_at: string
}

export default function ZonesPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('captures')


  const { data, isLoading } = useQuery({
    queryKey: ['zones', search, sortBy],
    queryFn: () => zonesApi.getZones({ search, sort: sortBy }).then(res => res.data)
  })

  const zones = data?.data || []

  const stats = [
    { label: 'Total Zones', value: zones.length, icon: MapPin },
    { label: 'Active Captures', value: zones.filter((z: Zone) => z.current_owner_id).length, icon: Crown },
    { label: 'Total Captures', value: zones.reduce((sum: number, z: Zone) => sum + z.capture_count, 0), icon: Trophy },
    { label: 'Avg Distance', value: zones.length > 0 ? Math.round(zones.reduce((sum: number, z: Zone) => sum + (z.weekly_distance || 0), 0) / zones.length) : 0, unit: 'km', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Zones</h1>
          <p className="mt-1 text-muted-foreground">Territory zones and ownership</p>
        </div>
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
                    {isLoading ? '-' : stat.value.toLocaleString()}
                    {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                  </p>
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
                placeholder="Search zones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="captures">Most Captures</SelectItem>
                <SelectItem value="distance">Most Distance</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : zones.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No zones found</p>
          </div>
        ) : (
          zones.map((zone: Zone) => (
            <Card key={zone.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500 text-white">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <Badge variant="outline">
                    {zone.capture_count} captures
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-1">{zone.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{zone.description}</p>

                {/* Current Owner */}
                {zone.current_owner_id ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {zone.current_owner_avatar ? (
                        <img src={zone.current_owner_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Crown className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{zone.current_owner_name}</p>
                      <p className="text-xs text-muted-foreground">Current Owner</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Target className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground">Unclaimed</p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>{(zone.weekly_distance || 0).toFixed(1)} km this week</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{zone.radius}m radius</span>
                  </div>
                </div>

                {/* H3 Index */}
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                  H3: {zone.h3_index}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
