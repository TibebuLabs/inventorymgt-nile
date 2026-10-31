-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(50) NOT NULL,
    `department_id` INTEGER NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    UNIQUE INDEX `Employee_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department_name` VARCHAR(191) NOT NULL,
    `department_head_id` INTEGER NULL,

    UNIQUE INDEX `Department_department_head_id_key`(`department_head_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `supplier` VARCHAR(191) NOT NULL,
    `suppliers_inv_other_no` VARCHAR(191) NOT NULL,
    `store_location` VARCHAR(191) NOT NULL,
    `purchase_req_num` INTEGER NOT NULL,
    `purchase_order_num` INTEGER NOT NULL,
    `approvment_id` INTEGER NULL,
    `total_id` INTEGER NULL,

    UNIQUE INDEX `Grn_total_id_key`(`total_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GrnItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grn_id` INTEGER NOT NULL,
    `ser_no` INTEGER NOT NULL,
    `description` INTEGER NOT NULL,
    `unit_measurement_id` INTEGER NOT NULL,
    `qua_ordered` INTEGER NOT NULL,
    `qua_delivered` INTEGER NOT NULL,
    `quantity_received` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_item_price` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Total` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `total_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Approvement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prepared_by_id` INTEGER NULL,
    `checked_by_id` INTEGER NULL,
    `received_by_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Srn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisition_work_unit` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `approvment_id` INTEGER NULL,
    `total_id` INTEGER NULL,

    UNIQUE INDEX `Srn_total_id_key`(`total_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SrnItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `srn_id` INTEGER NOT NULL,
    `serial_num` INTEGER NOT NULL,
    `description` INTEGER NOT NULL,
    `unit_measurement_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item` VARCHAR(191) NOT NULL,
    `location_shelves_no` VARCHAR(191) NOT NULL,
    `max_stock_level` INTEGER NOT NULL,
    `min_stock_level` INTEGER NOT NULL,
    `referance_key` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferanceScc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scc_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `grn_id` INTEGER NULL,
    `iv_id` INTEGER NULL,
    `unit_measurement_id` INTEGER NOT NULL,
    `stock_in_key` INTEGER NULL,
    `stock_out_key` INTEGER NULL,
    `stock_balance_key` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockIn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `ref_key` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,

    UNIQUE INDEX `StockIn_ref_key_key`(`ref_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockOut` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `ref_key` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `ref_key` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Siv` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `issued_to` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `store_req_num` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SivItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siv_id` INTEGER NOT NULL,
    `ser_num` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `um` INTEGER NOT NULL,
    `requested` INTEGER NOT NULL,
    `issued` INTEGER NOT NULL,
    `outstock` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `unit_measurement_id` INTEGER NOT NULL,
    `type_id` INTEGER NOT NULL,

    UNIQUE INDEX `Item_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnitMeasurement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unit` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UnitMeasurement_unit_key`(`unit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ItemType_type_key`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_role_key`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoreIssueVoucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `issued_to` VARCHAR(191) NOT NULL,
    `store_req_no` INTEGER NOT NULL,
    `total_id` INTEGER NULL,
    `date` DATE NOT NULL,

    UNIQUE INDEX `StoreIssueVoucher_total_id_key`(`total_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoreIssueVoucherItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description_id` INTEGER NOT NULL,
    `unit_measurement_id` INTEGER NOT NULL,
    `requested` INTEGER NOT NULL,
    `issued` INTEGER NOT NULL,
    `out_of_stock` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `remark` VARCHAR(191) NOT NULL,
    `store_issue_key` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `employee_id` INTEGER NOT NULL,
    `grn_id` INTEGER NULL,
    `srn_id` INTEGER NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_department_head_id_fkey` FOREIGN KEY (`department_head_id`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grn` ADD CONSTRAINT `Grn_approvment_id_fkey` FOREIGN KEY (`approvment_id`) REFERENCES `Approvement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grn` ADD CONSTRAINT `Grn_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrnItem` ADD CONSTRAINT `GrnItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrnItem` ADD CONSTRAINT `GrnItem_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GrnItem` ADD CONSTRAINT `GrnItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approvement` ADD CONSTRAINT `Approvement_prepared_by_id_fkey` FOREIGN KEY (`prepared_by_id`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approvement` ADD CONSTRAINT `Approvement_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Approvement` ADD CONSTRAINT `Approvement_received_by_id_fkey` FOREIGN KEY (`received_by_id`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Srn` ADD CONSTRAINT `Srn_approvment_id_fkey` FOREIGN KEY (`approvment_id`) REFERENCES `Approvement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Srn` ADD CONSTRAINT `Srn_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SrnItem` ADD CONSTRAINT `SrnItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SrnItem` ADD CONSTRAINT `SrnItem_srn_id_fkey` FOREIGN KEY (`srn_id`) REFERENCES `Srn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SrnItem` ADD CONSTRAINT `SrnItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Scc` ADD CONSTRAINT `Scc_item_fkey` FOREIGN KEY (`item`) REFERENCES `Item`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferanceScc` ADD CONSTRAINT `ReferanceScc_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferanceScc` ADD CONSTRAINT `ReferanceScc_scc_id_fkey` FOREIGN KEY (`scc_id`) REFERENCES `Scc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferanceScc` ADD CONSTRAINT `ReferanceScc_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferanceScc` ADD CONSTRAINT `ReferanceScc_iv_id_fkey` FOREIGN KEY (`iv_id`) REFERENCES `Siv`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockIn` ADD CONSTRAINT `StockIn_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOut` ADD CONSTRAINT `StockOut_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockBalance` ADD CONSTRAINT `StockBalance_ref_key_fkey` FOREIGN KEY (`ref_key`) REFERENCES `ReferanceScc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SivItem` ADD CONSTRAINT `SivItem_siv_id_fkey` FOREIGN KEY (`siv_id`) REFERENCES `Siv`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SivItem` ADD CONSTRAINT `SivItem_description_fkey` FOREIGN KEY (`description`) REFERENCES `Item`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `ItemType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreIssueVoucher` ADD CONSTRAINT `StoreIssueVoucher_total_id_fkey` FOREIGN KEY (`total_id`) REFERENCES `Total`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreIssueVoucherItem` ADD CONSTRAINT `StoreIssueVoucherItem_description_id_fkey` FOREIGN KEY (`description_id`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreIssueVoucherItem` ADD CONSTRAINT `StoreIssueVoucherItem_unit_measurement_id_fkey` FOREIGN KEY (`unit_measurement_id`) REFERENCES `UnitMeasurement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreIssueVoucherItem` ADD CONSTRAINT `StoreIssueVoucherItem_store_issue_key_fkey` FOREIGN KEY (`store_issue_key`) REFERENCES `StoreIssueVoucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_grn_id_fkey` FOREIGN KEY (`grn_id`) REFERENCES `Grn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_srn_id_fkey` FOREIGN KEY (`srn_id`) REFERENCES `Srn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
