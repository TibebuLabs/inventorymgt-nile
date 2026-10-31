/*
  Warnings:

  - You are about to drop the column `referance_key` on the `Scc` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[item]` on the table `Scc` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Scc` DROP COLUMN `referance_key`;

-- CreateIndex
CREATE UNIQUE INDEX `Scc_item_key` ON `Scc`(`item`);
