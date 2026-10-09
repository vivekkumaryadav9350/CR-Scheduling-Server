/*
  Warnings:

  - Changed the type of `start_time` on the `period` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end_time` on the `period` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "period" DROP COLUMN "start_time",
ADD COLUMN     "start_time" VARCHAR(5) NOT NULL,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" VARCHAR(5) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "period_start_time_end_time_key" ON "period"("start_time", "end_time");
