import type { Prisma, PrismaClient } from '@prisma/client';

export const upsertRunLoop = async (
  prisma: PrismaClient | Prisma.TransactionClient,
  args: {
    runId: string;
    cycleKey: string;
    loopStartIndex: number;
    loopEndIndex: number;
    boundaryHexes: string[];
    enclosedHexes: string[];
  }
): Promise<void> => {
  await prisma.runLoop.upsert({
    where: { runId: args.runId },
    update: {
      cycleKey: args.cycleKey,
      loopStartIndex: args.loopStartIndex,
      loopEndIndex: args.loopEndIndex,
      boundaryHexes: args.boundaryHexes as any,
      enclosedHexes: args.enclosedHexes as any
    },
    create: {
      runId: args.runId,
      cycleKey: args.cycleKey,
      loopStartIndex: args.loopStartIndex,
      loopEndIndex: args.loopEndIndex,
      boundaryHexes: args.boundaryHexes as any,
      enclosedHexes: args.enclosedHexes as any
    }
  });
};

