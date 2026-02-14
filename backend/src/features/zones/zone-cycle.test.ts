import { getWeeklyCycleWindowUtc } from './zone-cycle';

describe('zone cycle', () => {
  it('returns Monday 00:00 UTC as start', () => {
    const at = new Date('2025-12-28T12:34:56Z'); // Sunday
    const win = getWeeklyCycleWindowUtc(at);
    expect(win.start.toISOString()).toBe('2025-12-22T00:00:00.000Z');
    expect(win.end.toISOString()).toBe('2025-12-29T00:00:00.000Z');
    expect(win.cycleKey).toBe('2025-12-22');
  });

  it('treats Monday as same-cycle start', () => {
    const at = new Date('2025-12-29T00:00:00Z'); // Monday boundary
    const win = getWeeklyCycleWindowUtc(at);
    expect(win.start.toISOString()).toBe('2025-12-29T00:00:00.000Z');
    expect(win.cycleKey).toBe('2025-12-29');
  });
});

