// Haversine formula for calculating distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

// Calculate total distance from array of coordinates
export const calculateTotalDistance = (
  coordinates: Array<{ latitude: number; longitude: number }>
): number => {
  if (coordinates.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < coordinates.length; i++) {
    totalDistance += calculateDistance(
      coordinates[i - 1].latitude,
      coordinates[i - 1].longitude,
      coordinates[i].latitude,
      coordinates[i].longitude
    )
  }
  return totalDistance
}

// Calculate pace in minutes per kilometer
export const calculatePace = (distance: number, duration: number): number => {
  if (distance === 0) return 0
  return duration / 60 / (distance / 1000) // min/km
}

// Format pace as mm:ss
export const formatPace = (pace: number): string => {
  if (pace === 0 || !isFinite(pace)) return '--:--'
  const minutes = Math.floor(pace)
  const seconds = Math.floor((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Format duration as hh:mm:ss
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Format distance with appropriate units
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

// Calculate calories burned
// Using MET (Metabolic Equivalent of Task) formula
// Running: MET ~ 9.8
export const calculateCalories = (
  distance: number, // in meters
  duration: number, // in seconds
  weight: number = 70 // in kg, default average
): number => {
  const hours = duration / 3600
  const met = 9.8 // Running MET
  const calories = met * weight * hours
  return Math.round(calories)
}

// Calculate coins earned based on distance and pace
export const calculateCoins = (
  distance: number,
  averageSpeed: number,
  bonusMultiplier: number = 1
): number => {
  // Base coins: 1 per 100 meters
  const baseCoins = Math.floor(distance / 100)
  
  // Speed bonus: faster runs earn more
  let speedBonus = 1
  if (averageSpeed > 3) speedBonus = 1.2 // > 3 m/s (10.8 km/h)
  if (averageSpeed > 4) speedBonus = 1.5 // > 4 m/s (14.4 km/h)
  
  return Math.floor(baseCoins * speedBonus * bonusMultiplier)
}

// Calculate streak (consecutive days with runs)
export const calculateStreak = (runDates: Date[]): number => {
  if (runDates.length === 0) return 0
  
  // Sort dates in descending order
  const sorted = [...runDates].sort((a, b) => b.getTime() - a.getTime())
  
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check if there's a run today or yesterday to start the streak
  const lastRunDate = new Date(sorted[0])
  lastRunDate.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > 1) return 0 // Streak broken
  
  // Count consecutive days
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i])
    const next = new Date(sorted[i + 1])
    
    current.setHours(0, 0, 0, 0)
    next.setHours(0, 0, 0, 0)
    
    const diff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff === 1) {
      streak++
    } else if (diff === 0) {
      // Same day, continue checking
      continue
    } else {
      break
    }
  }
  
  return streak
}

// Calculate level based on total distance
export const calculateLevel = (totalDistance: number): number => {
  // Level up every 10km
  return Math.floor(totalDistance / 10000) + 1
}

// Calculate XP for next level
export const calculateNextLevelXP = (currentLevel: number): number => {
  return currentLevel * 10000
}

// H3 hexagon helpers for zone system
export const getH3Resolution = (level: number): number => {
  // Higher resolution = smaller hexagons
  // Level 1-5: Resolution 9 (~170m)
  // Level 6-15: Resolution 8 (~460m)
  // Level 16+: Resolution 7 (~1.2km)
  if (level <= 5) return 9
  if (level <= 15) return 8
  return 7
}

// Check if point is inside polygon (for custom zone shapes)
export const isPointInPolygon = (
  point: { lat: number; lng: number },
  polygon: Array<{ lat: number; lng: number }>
): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat
    const xj = polygon[j].lng, yj = polygon[j].lat
    
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)
    
    if (intersect) inside = !inside
  }
  return inside
}
