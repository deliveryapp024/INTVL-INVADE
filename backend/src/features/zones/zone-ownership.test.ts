import { computeZoneOwners } from './zone-ownership';

describe('zone ownership', () => {
  it('picks highest total distance per zone', () => {
    const rows = [
      { h3Index: 'X', userId: 'A', distanceM: 120, firstAt: new Date('2025-12-25T10:00:00Z') },
      { h3Index: 'X', userId: 'B', distanceM: 90, firstAt: new Date('2025-12-25T10:00:00Z') }
    ];
    const owners = computeZoneOwners(rows);
    expect(owners).toEqual([
      {
        h3Index: 'X',
        ownerUserId: 'A',
        ownerDistanceM: 120,
        tieBreakFirstAt: new Date('2025-12-25T10:00:00Z')
      }
    ]);
  });

  it('breaks ties by earliest firstAt then userId', () => {
    const rows = [
      { h3Index: 'X', userId: 'B', distanceM: 100, firstAt: new Date('2025-12-25T10:00:00Z') },
      { h3Index: 'X', userId: 'A', distanceM: 100, firstAt: new Date('2025-12-25T10:00:01Z') }
    ];
    const owners = computeZoneOwners(rows);
    expect(owners[0].ownerUserId).toBe('B');
  });

  it('sums multiple rows per user/zone', () => {
    const rows = [
      { h3Index: 'X', userId: 'A', distanceM: 60, firstAt: new Date('2025-12-25T10:00:10Z') },
      { h3Index: 'X', userId: 'A', distanceM: 70, firstAt: new Date('2025-12-25T10:00:00Z') },
      { h3Index: 'X', userId: 'B', distanceM: 100, firstAt: new Date('2025-12-25T10:00:00Z') }
    ];
    const owners = computeZoneOwners(rows);
    expect(owners[0].ownerUserId).toBe('A');
    expect(Math.round(owners[0].ownerDistanceM)).toBe(130);
    expect(owners[0].tieBreakFirstAt.toISOString()).toBe('2025-12-25T10:00:00.000Z');
  });
});

