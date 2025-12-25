export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

export const calculatePace = (distanceMeters: number, timeSeconds: number): number => {
  if (distanceMeters <= 0) return 0;
  
  const distanceKm = distanceMeters / 1000;
  const minutes = timeSeconds / 60;
  return minutes / distanceKm;
};

export const encodePolyline = (coordinates: { latitude: number; longitude: number }[]): string => {
  const encode = (num: number) => {
    let v = Math.round(num * 1e5);
    v = v < 0 ? ~(v << 1) : v << 1;
    let s = '';
    while (v >= 0x20) {
      s += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    s += String.fromCharCode(v + 63);
    return s;
  };

  let lastLat = 0;
  let lastLng = 0;
  let result = '';

  for (const coord of coordinates) {
    result += encode(coord.latitude - lastLat);
    result += encode(coord.longitude - lastLng);
    lastLat = coord.latitude;
    lastLng = coord.longitude;
  }

  return result;
};