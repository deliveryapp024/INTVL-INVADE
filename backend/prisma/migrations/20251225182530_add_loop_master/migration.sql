-- AlterTable
ALTER TABLE "run_zone_contributions" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'DISTANCE';

-- DropIndex
DROP INDEX "run_zone_contributions_run_id_h3_index_cycle_key_key";

-- CreateIndex
CREATE UNIQUE INDEX "run_zone_contributions_run_id_h3_index_cycle_key_source_key" ON "run_zone_contributions"("run_id", "h3_index", "cycle_key", "source");

-- CreateTable
CREATE TABLE "run_loops" (
    "run_id" TEXT NOT NULL,
    "cycle_key" TEXT NOT NULL,
    "loop_start_index" INTEGER NOT NULL,
    "loop_end_index" INTEGER NOT NULL,
    "boundary_hexes" JSONB NOT NULL,
    "enclosed_hexes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_loops_pkey" PRIMARY KEY ("run_id")
);

-- CreateIndex
CREATE INDEX "run_loops_cycle_key_idx" ON "run_loops"("cycle_key");

-- AddForeignKey
ALTER TABLE "run_loops" ADD CONSTRAINT "run_loops_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

