import prisma from '../lib/prisma';
import { gpsToRunHexes, H3_RESOLUTION_MVP } from '../features/runs/run-hexes';
import { replaceRunHexes } from '../features/runs/run-hexes.persistence';

const main = async () => {
  const batchSize = Number(process.env.BACKFILL_BATCH_SIZE ?? 200);

  const runs = await prisma.run.findMany({
    where: {
      status: 'FINALIZED',
      hexes: { none: {} }
    },
    include: { rawData: true },
    take: batchSize,
    orderBy: { createdAt: 'asc' }
  });

  let updated = 0;
  for (const run of runs) {
    if (!run.rawData?.rawData || !Array.isArray(run.rawData.rawData)) continue;

    const { runHexes } = await gpsToRunHexes(run.rawData.rawData as any[], H3_RESOLUTION_MVP);

    await prisma.$transaction(async (tx) => {
      await replaceRunHexes(tx, run.id, runHexes);
    });

    updated += 1;
    // eslint-disable-next-line no-console
    console.log(`Backfilled run_hexes for run ${run.id} (${runHexes.length} cells)`);
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

