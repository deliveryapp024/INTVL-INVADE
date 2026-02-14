import prisma from '../lib/prisma';
import { computeRunZoneContributions } from '../features/zones/zone-contributions';
import { H3_RESOLUTION_MVP } from '../features/runs/run-hexes';
import { replaceRunZoneContributions } from '../features/zones/zone.persistence';

const main = async () => {
  const batchSize = Number(process.env.BACKFILL_BATCH_SIZE ?? 200);

  const runs = await prisma.run.findMany({
    where: { status: 'FINALIZED' },
    include: { rawData: true },
    take: batchSize,
    orderBy: { createdAt: 'asc' }
  });

  let updated = 0;
  for (const run of runs) {
    if (!run.rawData?.rawData || !Array.isArray(run.rawData.rawData)) continue;

    const rawArr = run.rawData.rawData as any[];
    const last = rawArr.length > 0 ? rawArr[rawArr.length - 1] : undefined;
    const cycleAt = run.endTime ?? new Date(last?.time ?? Date.now());
    const { cycleKey, cycleStart, cycleEnd, contributions } = await computeRunZoneContributions(
      run.rawData.rawData as any[],
      H3_RESOLUTION_MVP,
      cycleAt
    );

    await prisma.$transaction(async (tx) => {
      await replaceRunZoneContributions(tx, {
        runId: run.id,
        userId: run.userId,
        cycleKey,
        cycleStart,
        cycleEnd,
        contributions
      });
    });

    updated += 1;
    // eslint-disable-next-line no-console
    console.log(`Backfilled zone contributions for run ${run.id} (${contributions.length} hexes)`);
  }

  // eslint-disable-next-line no-console
  console.log(`Backfill done. Updated ${updated} run(s).`);
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
