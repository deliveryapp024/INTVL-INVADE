import type { GPSPoint } from '../runs/runs.finalization';
import { getWeeklyCycleWindowUtc } from './zone-cycle';

export type RunZoneContribution = {
  h3Index: string;
  distanceM: number;
  firstAt: Date;
};

const R_EARTH = 6371e3; // meters
const toRad = (degrees: number): number => (degrees * Math.PI) / 180;

const haversineMeters = (p1: GPSPoint, p2: GPSPoint): number => {
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH * c;
};

export const computeRunZoneContributions = async (
  rawData: GPSPoint[],
  resolution: number,
  cycleAt: Date
): Promise<{ cycleKey: string; cycleStart: Date; cycleEnd: Date; contributions: RunZoneContribution[] }> => {
  const cycle = getWeeklyCycleWindowUtc(cycleAt);

  if (!rawData || rawData.length < 2) {
    return { cycleKey: cycle.cycleKey, cycleStart: cycle.start, cycleEnd: cycle.end, contributions: [] };
  }

  const sorted = [...rawData].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  const h3 = await import('h3-js');

  const totals = new Map<string, { distanceM: number; firstAt: Date }>();

  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    const t1 = new Date(p1.time);

    const a = h3.latLngToCell(p1.lat, p1.lng, resolution) as string;
    const b = h3.latLngToCell(p2.lat, p2.lng, resolution) as string;
    const dist = haversineMeters(p1, p2);

    let segmentCells: string[];
    if (a === b) {
      segmentCells = [a];
    } else {
      segmentCells = h3.gridPathCells(a, b) as string[];
    }

    const share = segmentCells.length > 0 ? dist / segmentCells.length : 0;

    for (const cell of segmentCells) {
      const existing = totals.get(cell);
      if (!existing) {
        totals.set(cell, { distanceM: share, firstAt: t1 });
      } else {
        existing.distanceM += share;
        if (t1.getTime() < existing.firstAt.getTime()) existing.firstAt = t1;
      }
    }
  }

  const contributions: RunZoneContribution[] = [...totals.entries()]
    .map(([h3Index, v]) => ({ h3Index, distanceM: v.distanceM, firstAt: v.firstAt }))
    .sort((x, y) => x.h3Index.localeCompare(y.h3Index));

  return { cycleKey: cycle.cycleKey, cycleStart: cycle.start, cycleEnd: cycle.end, contributions };
};

