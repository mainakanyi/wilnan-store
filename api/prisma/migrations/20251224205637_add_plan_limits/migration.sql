/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `subscriptionplan` ADD COLUMN `allowReports` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxProducts` INTEGER NOT NULL DEFAULT 50,
    ADD COLUMN `maxUsers` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `SubscriptionPlan_name_key` ON `SubscriptionPlan`(`name`);
