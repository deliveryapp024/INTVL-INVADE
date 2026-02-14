-- CreateTable
CREATE TABLE "run_zone_contributions" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "cycle_key" TEXT NOT NULL,
    "cycle_start" TIMESTAMP(3) NOT NULL,
    "cycle_end" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "h3_index" TEXT NOT NULL,
    "distance_m" DOUBLE PRECISION NOT NULL,
    "first_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_zone_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_ownerships" (
    "id" TEXT NOT NULL,
    "cycle_key" TEXT NOT NULL,
    "cycle_start" TIMESTAMP(3) NOT NULL,
    "cycle_end" TIMESTAMP(3) NOT NULL,
    "h3_index" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "owner_distance_m" DOUBLE PRECISION NOT NULL,
    "tie_break_first_at" TIMESTAMP(3) NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_zone_contributions_run_id_h3_index_cycle_key_key" ON "run_zone_contributions"("run_id", "h3_index", "cycle_key");

-- CreateIndex
CREATE INDEX "run_zone_contributions_cycle_key_h3_index_idx" ON "run_zone_contributions"("cycle_key", "h3_index");

-- CreateIndex
CREATE INDEX "run_zone_contributions_cycle_key_user_id_idx" ON "run_zone_contributions"("cycle_key", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "zone_ownerships_cycle_key_h3_index_key" ON "zone_ownerships"("cycle_key", "h3_index");

-- CreateIndex
CREATE INDEX "zone_ownerships_cycle_key_owner_user_id_idx" ON "zone_ownerships"("cycle_key", "owner_user_id");

-- CreateIndex
CREATE INDEX "zone_ownerships_h3_index_idx" ON "zone_ownerships"("h3_index");

-- AddForeignKey
ALTER TABLE "run_zone_contributions" ADD CONSTRAINT "run_zone_contributions_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

