-- CreateTable
CREATE TABLE "run_hexes" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "sequence_index" INTEGER NOT NULL,
    "h3_index" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_hexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_hexes_run_id_sequence_index_key" ON "run_hexes"("run_id", "sequence_index");

-- CreateIndex
CREATE INDEX "run_hexes_h3_index_idx" ON "run_hexes"("h3_index");

-- CreateIndex
CREATE INDEX "run_hexes_run_id_idx" ON "run_hexes"("run_id");

-- AddForeignKey
ALTER TABLE "run_hexes" ADD CONSTRAINT "run_hexes_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

