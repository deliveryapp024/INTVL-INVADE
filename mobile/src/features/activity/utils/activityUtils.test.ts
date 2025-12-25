import { calculateDistance, calculatePace } from './activityUtils';

describe('activityUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly (Haversine)', () => {
      // Coordinates for London and Paris
      const lat1 = 51.5074;
      const lon1 = -0.1278;
      const lat2 = 48.8566;
      const lon2 = 2.3522;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      
      // Approximately 343km
      expect(distance).toBeGreaterThan(340000);
      expect(distance).toBeLessThan(350000);
    });

    it('should return 0 for the same point', () => {
      const distance = calculateDistance(51.5, -0.1, 51.5, -0.1);
      expect(distance).toBe(0);
    });
  });

  describe('calculatePace', () => {
    it('should calculate pace correctly for 1km in 5 minutes', () => {
      const distanceMeters = 1000;
      const timeSeconds = 300; // 5 minutes
      const pace = calculatePace(distanceMeters, timeSeconds);
      
      // 300 seconds / 1 km = 300 seconds/km = 5.0 minutes/km
      expect(pace).toBe(5);
    });

    it('should handle zero distance gracefully', () => {
      const pace = calculatePace(0, 300);
      expect(pace).toBe(0);
    });
  });
});
