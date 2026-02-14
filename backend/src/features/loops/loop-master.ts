export type DetectedLoop = {
  loopStartIndex: number;
  loopEndIndex: number;
  boundaryHexes: string[];
};

export const detectFirstLoop = (runHexes: string[], minLoopLength: number): DetectedLoop | null => {
  // Track most recent index of each hex as we traverse. First valid loop is the
  // first time we see a repeat that meets minLoopLength.
  const lastSeen = new Map<string, number>();

  for (let j = 0; j < runHexes.length; j++) {
    const h = runHexes[j];
    const i = lastSeen.get(h);
    if (i !== undefined) {
      if (j - i >= minLoopLength) {
        return {
          loopStartIndex: i,
          loopEndIndex: j,
          boundaryHexes: runHexes.slice(i, j + 1)
        };
      }
    }
    lastSeen.set(h, j);
  }

  return null;
};

export const computeEnclosedHexes = async (
  boundaryHexes: string[],
  resolution: number
): Promise<{ enclosedHexes: string[] }> => {
  if (boundaryHexes.length < 4) return { enclosedHexes: [] };

  const h3 = await import('h3-js');

  // Use cell centers as polygon vertices (deterministic). Ensure closed ring.
  // `polygonToCells` accepts coordinates as [ [lng,lat], ... ] when isGeoJson=true.
  const ring = boundaryHexes.map((h) => {
    const [lat, lng] = h3.cellToLatLng(h) as [number, number];
    return [lng, lat] as [number, number];
  });

  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

  const filled = (h3.polygonToCells([ring], resolution, true) as string[]) ?? [];

  const boundarySet = new Set(boundaryHexes);
  const enclosed = filled.filter((c) => !boundarySet.has(c));
  enclosed.sort();

  return { enclosedHexes: enclosed };
};
