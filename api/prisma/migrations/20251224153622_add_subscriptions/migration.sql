-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TenantSubscription` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenantId` BIGINT NOT NULL,
    `planId` BIGINT NOT NULL,
    `status` ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TenantSubscription_tenantId_key`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TenantSubscription` ADD CONSTRAINT `TenantSubscription_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TenantSubscription` ADD CONSTRAINT `TenantSubscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
