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
    const { data: zone, error } = await supabaseAdmin
      .from('zones')
      .update({ ...data, updated_at: new Date().toISOString() })
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

    if (user.level < zone.min_level) {
      throw new AppError(
        `Level ${zone.min_level} required to capture this zone`,
        403,
        'LEVEL_TOO_LOW'
      )
    }

    // Verify user is within zone radius
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      zone.center_lat,
      zone.center_lng
    )

    if (distance > zone.radius) {
      throw new AppError(
        'You must be within the zone to capture it',
        400,
        'OUTSIDE_ZONE'
      )
    }

    // Get current owner before capture
    const { data: currentOwnerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select(`
        *,
        user:user_id (*)
      `)
      .eq('zone_id', zoneId)
      .order('captured_at', { ascending: false })
      .limit(1)

    const previousOwner = currentOwnerships?.[0]?.user

    // Check if user already owns the zone
    if (previousOwner?.id === userId) {
      throw new AppError('You already own this zone', 400, 'ALREADY_OWNER')
    }

    // Create ownership record
    const ownershipData: InsertTables<'zone_ownerships'> = {
      zone_id: zoneId,
      user_id: userId,
      captured_at: new Date().toISOString(),
      defended_at: null
    }

    const { error: ownershipError } = await supabaseAdmin
      .from('zone_ownerships')
      .insert(ownershipData)

    if (ownershipError) {
      throw new AppError(ownershipError.message, 500, 'DATABASE_ERROR')
    }

    // Award coins to user
    await supabaseAdmin
      .from('users')
      .update({
        coins: supabaseAdmin.rpc('increment_coins', { amount: zone.coins_reward })
      })
      .eq('id', userId)

    return {
      success: true,
      zone,
      previousOwner: previousOwner || undefined
    }
  }

  // Get zones owned by user
  async getUserZones(userId: string): Promise<ZoneWithDetails[]> {
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select('zone_id')
      .eq('user_id', userId)

    if (!ownerships || ownerships.length === 0) {
      return []
    }

    const zoneIds = [...new Set(ownerships.map(o => o.zone_id))]

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

    const userZoneIds = new Set(currentOwnerships?.map(o => o.zone_id) || [])

    return (zones || []).map(zone => ({
      ...zone,
      currentOwner: null, // Will be populated if needed
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

    const nearbyZones = (zones || []).filter(zone => {
      const distance = calculateDistance(
        latitude,
        longitude,
        zone.center_lat,
        zone.center_lng
      )
      return distance <= radius
    })

    // Get ownership info
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select(`
        *,
        user:user_id (*)
      `)
      .in('zone_id', nearbyZones.map(z => z.id))
      .order('captured_at', { ascending: false })

    const latestOwnerships = new Map<string, typeof ownerships[0]>()
    ownerships?.forEach(o => {
      if (!latestOwnerships.has(o.zone_id)) {
        latestOwnerships.set(o.zone_id, o)
      }
    })

    return nearbyZones.map(zone => {
      const ownership = latestOwnerships.get(zone.id)
      return {
        ...zone,
        currentOwner: ownership?.user || null,
        capturedAt: ownership?.captured_at || null,
        isOwnedByUser: false
      }
    })
  }

  // Get zone leaderboard
  async getZoneLeaderboard(zoneId: string, limit: number = 10): Promise<Array<{ user: User; captures: number }>> {
    const { data: ownerships } = await supabaseAdmin
      .from('zone_ownerships')
      .select(`
        user:user_id (*)
      `)
      .eq('zone_id', zoneId)

    if (!ownerships) return []

    // Count captures per user
    const captureCounts = new Map<string, { user: User; captures: number }>()
    ownerships.forEach(o => {
      const user = o.user as User
      if (captureCounts.has(user.id)) {
        captureCounts.get(user.id)!.captures++
      } else {
        captureCounts.set(user.id, { user, captures: 1 })
      }
    })

    return Array.from(captureCounts.values())
      .sort((a, b) => b.captures - a.captures)
      .slice(0, limit)
  }
}

export default new ZoneService()
