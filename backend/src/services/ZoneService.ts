import { supabaseAdmin } from '../config/supabase'
import { Zone, ZoneOwnership, User, InsertTables } from '../types'
import { AppError } from '../middleware/errorHandler'
import { calculateDistance } from '../utils/calculations'

interface ZoneCaptureData {
  zoneId: string
  userId: string
  userLocation: {
    latitude: number
    longitude: number
  }
}

interface ZoneWithDetails extends Zone {
  currentOwner: User | null
  capturedAt: string | null
  isOwnedByUser: boolean
}

class ZoneService {
  // Get all zones
  async getAllZones(userId?: string): Promise<ZoneWithDetails[]> {
    const { data: zones, error } = await supabaseAdmin
      .from('zones')
      .select('*')
      .order('min_level', { ascending: true })

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    // Get ownership info for all zones
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select(`
        *,
        user:user_id (*)
      `)
      .in('zone_id', zones?.map(z => z.id) || [])
      .order('captured_at', { ascending: false })

    const latestOwnerships = new Map<string, typeof ownerships[0]>()
    ownerships?.forEach(o => {
      if (!latestOwnerships.has(o.zone_id)) {
        latestOwnerships.set(o.zone_id, o)
      }
    })

    return (zones || []).map(zone => {
      const ownership = latestOwnerships.get(zone.id)
      return {
        ...zone,
        currentOwner: ownership?.user || null,
        capturedAt: ownership?.captured_at || null,
        isOwnedByUser: ownership?.user_id === userId
      }
    })
  }

  // Get zone by ID
  async getZoneById(zoneId: string, userId?: string): Promise<ZoneWithDetails> {
    const { data: zone, error } = await supabaseAdmin
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single()

    if (error || !zone) {
      throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND')
    }

    // Get ownership info
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select(`
        *,
        user:user_id (*)
      `)
      .eq('zone_id', zoneId)
      .order('captured_at', { ascending: false })
      .limit(1)

    const ownership = ownerships?.[0]

    return {
      ...zone,
      currentOwner: ownership?.user || null,
      capturedAt: ownership?.captured_at || null,
      isOwnedByUser: ownership?.user_id === userId
    }
  }

  // Create zone (admin only)
  async createZone(data: InsertTables<'zones'>): Promise<Zone> {
    const { data: zone, error } = await supabaseAdmin
      .from('zones')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return zone
  }

  // Update zone (admin only)
  async updateZone(zoneId: string, data: Partial<Zone>): Promise<Zone> {
    const updateData: any = { ...data, updated_at: new Date().toISOString() }
    const { data: zone, error } = await supabaseAdmin
      .from('zones')
      .update(updateData)
      .eq('id', zoneId)
      .select()
      .single()

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    return zone
  }

  // Delete zone (admin only)
  async deleteZone(zoneId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('zones')
      .delete()
      .eq('id', zoneId)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }
  }

  // Capture a zone
  async captureZone(data: ZoneCaptureData): Promise<{ success: boolean; zone: Zone; previousOwner?: User }> {
    const { zoneId, userId, userLocation } = data

    // Get zone details
    const { data: zone, error: zoneError } = await supabaseAdmin
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single()

    if (zoneError || !zone) {
      throw new AppError('Zone not found', 404, 'ZONE_NOT_FOUND')
    }

    // Check user level requirement
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('level')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    const userLevel = (user as any).level || 1
    const zoneMinLevel = (zone as any).min_level || 1
    
    if (userLevel < zoneMinLevel) {
      throw new AppError(
        `Level ${zoneMinLevel} required to capture this zone`,
        403,
        'LEVEL_TOO_LOW'
      )
    }

    // Verify user is within zone radius
    const zoneData = zone as any
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zoneData.center_lat,
      zoneData.center_lng
    )

    if (distance > zoneData.radius) {
      throw new AppError(
        'You must be within the zone to capture it',
        400,
        'OUTSIDE_ZONE'
      )
    }

    // Get current owner before capture
    const { data: currentOwnerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('*')
      .eq('zone_id', zoneId)
      .order('captured_at', { ascending: false })
      .limit(1)

    const previousOwnership = currentOwnerships?.[0] as any
    let previousOwner: User | null = null
    
    if (previousOwnership) {
      const { data: prevUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', previousOwnership.user_id)
        .single()
      previousOwner = prevUser as User
    }

    // Check if user already owns the zone
    if (previousOwner?.id === userId) {
      throw new AppError('You already own this zone', 400, 'ALREADY_OWNER')
    }

    // Create ownership record
    const ownershipData = {
      zone_id: zoneId,
      user_id: userId,
      captured_at: new Date().toISOString(),
      defended_at: null
    }

    const { error: ownershipError } = await supabaseAdmin
      .from('zone_ownerships')
      .insert(ownershipData as any)

    if (ownershipError) {
      throw new AppError(ownershipError.message, 500, 'DATABASE_ERROR')
    }

    // Award coins to user
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single()
    
    const currentCoins = (userData as any)?.coins || 0
    const rewardCoins = zoneData.coins_reward || 0
    
    await supabaseAdmin
      .from('users')
      .update({ coins: currentCoins + rewardCoins })
      .eq('id', userId)

    return {
      success: true,
      zone,
      previousOwner: previousOwner || undefined
    }
  }

  // Get zones owned by user
  async getUserZones(userId: string) {
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('zone_id')
      .eq('user_id', userId)

    if (!ownerships || ownerships.length === 0) {
      return []
    }

    const zoneIds = [...new Set(ownerships.map((o: any) => o.zone_id))]

    const { data: zones, error } = await supabaseAdmin
      .from('zones')
      .select('*')
      .in('id', zoneIds)

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    // Get current ownership status
    const { data: currentOwnerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('*')
      .eq('user_id', userId)

    const userZoneIds = new Set(currentOwnerships?.map((o: any) => o.zone_id) || [])

    return (zones || []).map((zone: any) => ({
      ...zone,
      currentOwner: null,
      capturedAt: null,
      isOwnedByUser: userZoneIds.has(zone.id)
    }))
  }

  // Get zones near location
  async getNearbyZones(
    latitude: number,
    longitude: number,
    radius: number = 5000 // 5km default
  ): Promise<ZoneWithDetails[]> {
    // Get all zones and filter by distance
    const { data: zones, error } = await supabaseAdmin
      .from('zones')
      .select('*')

    if (error) {
      throw new AppError(error.message, 500, 'DATABASE_ERROR')
    }

    const nearbyZones = (zones || []).filter((zone: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        zone.center_lat,
        zone.center_lng
      )
      return distance <= radius
    })

    // Get ownership info
    const zoneIdList = nearbyZones.map((z: any) => z.id)
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('*')
      .in('zone_id', zoneIdList)
      .order('captured_at', { ascending: false })

    const latestOwnerships = new Map<string, any>()
    ownerships?.forEach((o: any) => {
      if (!latestOwnerships.has(o.zone_id)) {
        latestOwnerships.set(o.zone_id, o)
      }
    })

    return nearbyZones.map((zone: any) => {
      const ownership = latestOwnerships.get(zone.id)
      return {
        ...zone,
        currentOwner: null,
        capturedAt: ownership?.captured_at || null,
        isOwnedByUser: false
      }
    })
  }

  // Get zone leaderboard
  async getZoneLeaderboard(zoneId: string, limit: number = 10): Promise<Array<{ user: User; captures: number }>> {
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('user_id')
      .eq('zone_id', zoneId)

    if (!ownerships) return []
    
    // Get user details
    const userIds = [...new Set(ownerships.map((o: any) => o.user_id))]
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('id', userIds)
    
    const userMap = new Map(users?.map((u: any) => [u.id, u]) || [])

    // Count captures per user
    const captureCounts = new Map<string, number>()
    ownerships.forEach((o: any) => {
      captureCounts.set(o.user_id, (captureCounts.get(o.user_id) || 0) + 1)
    })

    return Array.from(captureCounts.entries())
      .map(([userId, captures]) => ({ user: userMap.get(userId) as User, captures }))
      .filter(item => item.user)
      .sort((a, b) => b.captures - a.captures)
      .slice(0, limit)
  }
}

export default new ZoneService()
