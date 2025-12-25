import { calculateMetrics, validateRun, RunMetrics, ValidationResult } from './runs.finalization';

describe('Run Finalization Logic', () => {
    const mockRawData = [
        { lat: 0, lng: 0, time: '2025-01-01T10:00:00Z' },
        { lat: 0.0001, lng: 0, time: '2025-01-01T10:00:10Z' }, // ~11m away, 10s later
        { lat: 0.0002, lng: 0, time: '2025-01-01T10:00:20Z' }  // Another ~11m
    ];

    describe('calculateMetrics', () => {
        it('should calculate accurate distance and duration', () => {
            const metrics = calculateMetrics(mockRawData);
            expect(metrics.distance_m).toBeGreaterThan(20);
            expect(metrics.distance_m).toBeLessThan(25);
            expect(metrics.duration_s).toBe(20);
            expect(metrics.max_speed).toBeGreaterThan(0);
        });

        it('should handle single point runs', () => {
            const metrics = calculateMetrics([{ lat: 0, lng: 0, time: '2025-01-01T10:00:00Z' }]);
            expect(metrics.distance_m).toBe(0);
            expect(metrics.duration_s).toBe(0);
        });
    });

    describe('validateRun', () => {
        const validMetrics: RunMetrics = {
            distance_m: 5000,
            duration_s: 1800, // 30 mins
            avg_pace: 360,     // 6 min/km
            max_speed: 3.5     // ~12 km/h
        };

        it('should accept a valid run', () => {
            const result = validateRun(validMetrics, mockRawData);
            expect(result.valid).toBe(true);
            expect(result.reason).toBeNull();
        });

        it('should reject run with insufficient distance', () => {
            const result = validateRun({ ...validMetrics, distance_m: 100 }, mockRawData);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('INSUFFICIENT_DISTANCE');
        });

        it('should reject run with insufficient duration', () => {
            const result = validateRun({ ...validMetrics, duration_s: 60 }, mockRawData);
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('INSUFFICIENT_DURATION');
        });

        it('should reject run with unrealistic speed', () => {
            const result = validateRun({ ...validMetrics, max_speed: 100 }, mockRawData); // 100 m/s
            expect(result.valid).toBe(false);
            expect(result.reason).toBe('UNREALISTIC_SPEED');
        });

        // Add gap check tests when logic is implemented
    });
});
