import { dedupeSequential, gpsToRunHexes, H3_RESOLUTION_MVP } from './run-hexes';

describe('run hex mapping', () => {
  it('dedupeSequential preserves order and removes only adjacent duplicates', () => {
    const input = ['a', 'a', 'b', 'b', 'a', 'a', 'c'];
    expect(dedupeSequential(input)).toEqual(['a', 'b', 'a', 'c']);
  });

  it('gpsToRunHexes maps points to H3 cells at MVP resolution', async () => {
    const raw = [
      { lat: 12.9716, lng: 77.5946, time: '2025-12-25T10:00:00Z' },
      { lat: 12.9717, lng: 77.5947, time: '2025-12-25T10:00:05Z' }
    ];

    const { runHexes } = await gpsToRunHexes(raw, H3_RESOLUTION_MVP);
    expect(runHexes.length).toBeGreaterThan(0);
    expect(typeof runHexes[0]).toBe('string');
  });

  it('gpsToRunHexes outputs a continuous H3 path (neighbors)', async () => {
    // Two points far enough to cross multiple cells (still a realistic short segment).
    const raw = [
      { lat: 12.9716, lng: 77.5946, time: '2025-12-25T10:00:00Z' },
      { lat: 12.9850, lng: 77.6100, time: '2025-12-25T10:00:20Z' }
    ];

    const { runHexes } = await gpsToRunHexes(raw, H3_RESOLUTION_MVP);
    expect(runHexes.length).toBeGreaterThan(1);

    const h3 = await import('h3-js');
    for (let i = 0; i < runHexes.length - 1; i++) {
      expect(h3.gridDistance(runHexes[i], runHexes[i + 1])).toBe(1);
    }
  });
});
