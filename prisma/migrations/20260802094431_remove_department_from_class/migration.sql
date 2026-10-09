/*
  Warnings:

  - You are about to drop the column `department_id` on the `class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `class` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_department_id_fkey";

-- DropIndex
DROP INDEX "class_department_id_idx";

-- DropIndex
DROP INDEX "class_department_id_name_key";

-- AlterTable
ALTER TABLE "class" DROP COLUMN "department_id";

-- CreateIndex
CREATE UNIQUE INDEX "class_name_key" ON "class"("name");
