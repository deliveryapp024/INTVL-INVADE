export interface GPSPoint {
    lat: number;
    lng: number;
    time: string; // ISO String
}

export interface RunMetrics {
    distance_m: number;
    duration_s: number;
    avg_pace: number; // s/km
    max_speed: number; // m/s
}

export interface ValidationResult {
    valid: boolean;
    reason: string | null;
}

// Constants for Validation (Anti-Cheat)
const MAX_SPEED_MS = 6.5; // ~23 km/h
const MIN_DURATION_S = 120; // 2 minutes
const MIN_DISTANCE_M = 300; // 300 meters

const R_EARTH = 6371e3; // meters

function toRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

// Haversine formula
function getDistance(p1: GPSPoint, p2: GPSPoint): number {
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R_EARTH * c;
}

export const calculateMetrics = (rawData: GPSPoint[]): RunMetrics => {
    if (!rawData || rawData.length < 2) {
        return { distance_m: 0, duration_s: 0, avg_pace: 0, max_speed: 0 };
    }

    // Ensure sorted by time? 
    // The spec says "Points must be sorted cronologically prior to computation"
    // We'll perform a sort here to be safe and deterministic
    const sortedData = [...rawData].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    let totalDist = 0;
    let maxSpeed = 0;

    for (let i = 0; i < sortedData.length - 1; i++) {
        const p1 = sortedData[i];
        const p2 = sortedData[i + 1];

        const dist = getDistance(p1, p2);
        const timeDiff = (new Date(p2.time).getTime() - new Date(p1.time).getTime()) / 1000;

        totalDist += dist;

        if (timeDiff > 0) {
            const speed = dist / timeDiff;
            if (speed > maxSpeed) maxSpeed = speed;
        }
    }

    const startTime = new Date(sortedData[0].time).getTime();
    const endTime = new Date(sortedData[sortedData.length - 1].time).getTime();
    const duration = (endTime - startTime) / 1000;

    const avgPace = (distance_m: number, duration_s: number) => {
        if (distance_m === 0) return 0;
        return duration_s / (distance_m / 1000);
    };

    return {
        distance_m: totalDist,
        duration_s: duration,
        avg_pace: avgPace(totalDist, duration),
        max_speed: maxSpeed
    };
};

export const validateRun = (metrics: RunMetrics, rawData: GPSPoint[]): ValidationResult => {
    if (metrics.distance_m < MIN_DISTANCE_M) {
        return { valid: false, reason: 'INSUFFICIENT_DISTANCE' };
    }

    if (metrics.duration_s < MIN_DURATION_S) {
        return { valid: false, reason: 'INSUFFICIENT_DURATION' };
    }

    if (metrics.max_speed > MAX_SPEED_MS) {
        return { valid: false, reason: 'UNREALISTIC_SPEED' };
    }

    return { valid: true, reason: null };
};
