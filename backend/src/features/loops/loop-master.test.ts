import { computeEnclosedHexes, detectFirstLoop } from './loop-master';

describe('Loop Master', () => {
  it('detects first valid loop by revisit with min length', () => {
    const runHexes = ['A', 'B', 'C', 'D', 'E', 'A'];
    const loop = detectFirstLoop(runHexes, 5);
    expect(loop).toEqual({
      loopStartIndex: 0,
      loopEndIndex: 5,
      boundaryHexes: ['A', 'B', 'C', 'D', 'E', 'A']
    });
  });

  it('rejects trivial backtracks shorter than MIN_LOOP_LENGTH', () => {
    const runHexes = ['A', 'B', 'A'];
    expect(detectFirstLoop(runHexes, 5)).toBeNull();
  });

  it('computes enclosed hexes for a simple ring', async () => {
    const h3 = await import('h3-js');
    const center = h3.latLngToCell(12.9716, 77.5946, 8) as string;
    const ring = (h3.gridRing(center, 1) as string[]).slice();
    // Close the loop by returning to the first boundary cell
    const boundary = [...ring, ring[0]];

    const { enclosedHexes } = await computeEnclosedHexes(boundary, 8);
    // For a ring around a center, the center should be enclosed (or at least some cells).
    expect(enclosedHexes.length).toBeGreaterThan(0);
  });
});

