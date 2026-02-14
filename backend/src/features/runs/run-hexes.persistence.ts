import type { Prisma, PrismaClient } from '@prisma/client';

export const replaceRunHexes = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  runId: string,
  runHexes: string[]
): Promise<void> => {
  await prisma.runHex.deleteMany({ where: { runId } });

  if (runHexes.length === 0) return;

  await prisma.runHex.createMany({
    data: runHexes.map((h3Index, sequenceIndex) => ({
      runId,
      sequenceIndex,
      h3Index
    }))
  });
};
