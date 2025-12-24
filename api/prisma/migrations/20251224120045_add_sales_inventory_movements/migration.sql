-- CreateTable
CREATE TABLE `Sale` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenantId` BIGINT NOT NULL,
    `cashierId` BIGINT NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleItem` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `saleId` BIGINT NOT NULL,
    `productId` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryMovement` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenantId` BIGINT NOT NULL,
    `productId` BIGINT NOT NULL,
    `type` ENUM('OPENING', 'RESTOCK', 'SALE', 'RETURN', 'ADJUSTMENT', 'DAMAGE', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reference` VARCHAR(191) NULL,
    `createdBy` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryMovement_tenantId_productId_idx`(`tenantId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryMovement` ADD CONSTRAINT `InventoryMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
