export type ZoneContributionRow = {
  h3Index: string;
  userId: string;
  distanceM: number;
  firstAt: Date;
};

export type ZoneOwner = {
  h3Index: string;
  ownerUserId: string;
  ownerDistanceM: number;
  tieBreakFirstAt: Date;
};

export const computeZoneOwners = (rows: ZoneContributionRow[]): ZoneOwner[] => {
  const byZoneUser = new Map<string, { h3Index: string; userId: string; distanceM: number; firstAt: Date }>();

  for (const row of rows) {
    const key = `${row.h3Index}::${row.userId}`;
    const existing = byZoneUser.get(key);
    if (!existing) {
      byZoneUser.set(key, {
        h3Index: row.h3Index,
        userId: row.userId,
        distanceM: row.distanceM,
        firstAt: row.firstAt
      });
      continue;
    }

    existing.distanceM += row.distanceM;
    if (row.firstAt.getTime() < existing.firstAt.getTime()) existing.firstAt = row.firstAt;
  }

  const candidatesByZone = new Map<string, { userId: string; distanceM: number; firstAt: Date }[]>();
  for (const entry of byZoneUser.values()) {
    const list = candidatesByZone.get(entry.h3Index) ?? [];
    list.push({ userId: entry.userId, distanceM: entry.distanceM, firstAt: entry.firstAt });
    candidatesByZone.set(entry.h3Index, list);
  }

  const owners: ZoneOwner[] = [];
  for (const [h3Index, candidates] of candidatesByZone.entries()) {
    candidates.sort((a, b) => {
      if (b.distanceM !== a.distanceM) return b.distanceM - a.distanceM;
      const ta = a.firstAt.getTime();
      const tb = b.firstAt.getTime();
      if (ta !== tb) return ta - tb;
      return a.userId.localeCompare(b.userId);
    });

    const winner = candidates[0];
    owners.push({
      h3Index,
      ownerUserId: winner.userId,
      ownerDistanceM: winner.distanceM,
      tieBreakFirstAt: winner.firstAt
    });
  }

  owners.sort((a, b) => a.h3Index.localeCompare(b.h3Index));
  return owners;
};

