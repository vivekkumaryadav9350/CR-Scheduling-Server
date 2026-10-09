/*
  Warnings:

  - Made the column `created_at` on table `class` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `class` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `period` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `period` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `role` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `role` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `schedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `section` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `section` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `subject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `teacher` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "class" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "department" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "period" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "role" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "schedule" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "section" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "subject" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "teacher" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET NOT NULL;
