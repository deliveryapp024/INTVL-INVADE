import type { Prisma, PrismaClient } from '@prisma/client';
import type { ZoneOwner } from './zone-ownership';

export const replaceRunZoneContributions = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  args: {
    runId: string;
    userId: string;
    cycleKey: string;
    cycleStart: Date;
    cycleEnd: Date;
    contributions: { h3Index: string; distanceM: number; firstAt: Date }[];
    source?: string;
  }
): Promise<void> => {
  const { runId, cycleKey, contributions, cycleStart, cycleEnd, userId } = args;
  const source = args.source ?? 'DISTANCE';

  await prisma.runZoneContribution.deleteMany({ where: { runId, cycleKey, source } });
  if (contributions.length === 0) return;

  await prisma.runZoneContribution.createMany({
    data: contributions.map((c) => ({
      runId,
      userId,
      cycleKey,
      cycleStart,
      cycleEnd,
      h3Index: c.h3Index,
      distanceM: c.distanceM,
      firstAt: c.firstAt,
      source
    }))
  });
};

export const replaceZoneOwnershipsForHexes = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  args: {
    cycleKey: string;
    cycleStart: Date;
    cycleEnd: Date;
    owners: ZoneOwner[];
    h3Indices: string[];
  }
): Promise<void> => {
  const { cycleKey, owners, h3Indices, cycleStart, cycleEnd } = args;

  await prisma.zoneOwnership.deleteMany({
    where: {
      cycleKey,
      h3Index: { in: h3Indices }
    }
  });

  if (owners.length === 0) return;

  await prisma.zoneOwnership.createMany({
    data: owners.map((o) => ({
      cycleKey,
      cycleStart,
      cycleEnd,
      h3Index: o.h3Index,
      ownerUserId: o.ownerUserId,
      ownerDistanceM: o.ownerDistanceM,
      tieBreakFirstAt: o.tieBreakFirstAt
    }))
  });
};
