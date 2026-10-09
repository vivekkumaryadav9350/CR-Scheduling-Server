/*
  Warnings:

  - You are about to drop the column `department_id` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `department_id` on the `subject` table. All the data in the column will be lost.
  - You are about to drop the column `department_id` on the `teacher` table. All the data in the column will be lost.
  - You are about to drop the `department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_department_id_fkey";

-- DropForeignKey
ALTER TABLE "subject" DROP CONSTRAINT "subject_department_id_fkey";

-- DropForeignKey
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_department_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_department_id_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_role_id_fkey";

-- DropIndex
DROP INDEX "schedule_department_id_idx";

-- DropIndex
DROP INDEX "subject_department_id_idx";

-- DropIndex
DROP INDEX "subject_department_id_name_key";

-- DropIndex
DROP INDEX "teacher_department_id_idx";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "department_id";

-- AlterTable
ALTER TABLE "subject" DROP COLUMN "department_id";

-- AlterTable
ALTER TABLE "teacher" DROP COLUMN "department_id",
ADD COLUMN     "email" VARCHAR(100) NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE "department";

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hod" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "hod_group" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hod_email_key" ON "hod"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hod_employee_code_key" ON "hod"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "hod_hod_group_key" ON "hod"("hod_group");

-- CreateIndex
CREATE UNIQUE INDEX "subject_name_key" ON "subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_email_key" ON "teacher"("email");
