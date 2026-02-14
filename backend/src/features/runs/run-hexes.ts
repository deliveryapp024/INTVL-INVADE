import type { GPSPoint } from './runs.finalization';

export const H3_RESOLUTION_MVP = 8;

export type H3Index = string;

export type RunHexesResult = {
  runHexes: H3Index[];
};

export const dedupeSequential = (cells: H3Index[]): H3Index[] => {
  const out: H3Index[] = [];
  for (const cell of cells) {
    if (out.length === 0 || out[out.length - 1] !== cell) out.push(cell);
  }
  return out;
};

/**
 * Converts GPS samples into a continuous H3 traversal path.
 *
 * Continuity strategy:
 * - Map each GPS point to an H3 cell.
 * - For each consecutive pair of cells, use H3 grid path to fill intermediate cells.
 * - Deduplicate sequential duplicates while preserving order.
 *
 * H3 dependency is required at runtime, but imported dynamically so unit tests can
 * assert pre-implementation failures without a hard dependency.
 */
export const gpsToRunHexes = async (
  rawData: GPSPoint[],
  resolution: number = H3_RESOLUTION_MVP
): Promise<RunHexesResult> => {
  if (!rawData || rawData.length === 0) return { runHexes: [] };

  const sorted = [...rawData].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const h3 = await import('h3-js');

  const pointCells = sorted.map((p) => h3.latLngToCell(p.lat, p.lng, resolution) as string);

  const pathCells: H3Index[] = [];
  for (let i = 0; i < pointCells.length; i++) {
    if (i === 0) {
      pathCells.push(pointCells[i]);
      continue;
    }

    const a = pointCells[i - 1];
    const b = pointCells[i];
    if (a === b) continue;

    // gridPathCells includes both endpoints.
    let segment: string[];
    try {
      segment = h3.gridPathCells(a, b) as string[];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      error.message = `Failed to compute H3 grid path from ${a} to ${b}: ${error.message}`;
      throw error;
    }

    // Avoid duplicating the last cell already in the path.
    const segmentWithoutFirst = segment.slice(1);
    for (const cell of segmentWithoutFirst) pathCells.push(cell);
  }

  return { runHexes: dedupeSequential(pathCells) };
};

