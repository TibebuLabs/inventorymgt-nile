-- DropForeignKey
ALTER TABLE `SrnItem` DROP FOREIGN KEY `SrnItem_description_fkey`;

-- DropIndex
DROP INDEX `SrnItem_description_fkey` ON `SrnItem`;

-- AlterTable
ALTER TABLE `SrnItem` MODIFY `description` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `SrnItem` ADD CONSTRAINT `SrnItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;
