import prisma from '../lib/prisma';
import { getWeeklyCycleWindowUtc } from '../features/zones/zone-cycle';
import { computeZoneOwners } from '../features/zones/zone-ownership';
import { replaceZoneOwnershipsForHexes } from '../features/zones/zone.persistence';

const main = async () => {
  const at = process.env.CYCLE_AT ? new Date(process.env.CYCLE_AT) : new Date();
  const { cycleKey, start: cycleStart, end: cycleEnd } = getWeeklyCycleWindowUtc(at);

  const rows = await prisma.runZoneContribution.findMany({
    where: { cycleKey },
    select: { h3Index: true, userId: true, distanceM: true, firstAt: true }
  });

  const owners = computeZoneOwners(
    rows.map((r) => ({
      h3Index: r.h3Index,
      userId: r.userId,
      distanceM: r.distanceM,
      firstAt: r.firstAt
    }))
  );

  const h3Indices = [...new Set(rows.map((r) => r.h3Index))].sort();

  await prisma.$transaction(async (tx) => {
    await replaceZoneOwnershipsForHexes(tx, { cycleKey, cycleStart, cycleEnd, owners, h3Indices });
  });

  // eslint-disable-next-line no-console
  console.log(`Recomputed zone ownerships for cycle ${cycleKey}: ${owners.length} owned zone(s).`);
};

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

