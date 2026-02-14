import { computeRunZoneContributions } from './zone-contributions';
import { H3_RESOLUTION_MVP } from '../runs/run-hexes';

describe('zone contributions', () => {
  it('attributes non-zero distance to at least one hex for a simple segment', async () => {
    const raw = [
      { lat: 12.9716, lng: 77.5946, time: '2025-12-22T00:00:00Z' },
      { lat: 12.9726, lng: 77.5956, time: '2025-12-22T00:00:10Z' }
    ];

    const result = await computeRunZoneContributions(raw, H3_RESOLUTION_MVP, new Date('2025-12-22T12:00:00Z'));
    expect(result.cycleKey).toBe('2025-12-22');
    expect(result.contributions.length).toBeGreaterThan(0);
    const total = result.contributions.reduce((acc, c) => acc + c.distanceM, 0);
    expect(total).toBeGreaterThan(0);
  });
});

