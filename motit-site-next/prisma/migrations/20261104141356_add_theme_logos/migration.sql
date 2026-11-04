/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SiteSettings` DROP COLUMN `logoUrl`,
    ADD COLUMN `logoDarkUrl` VARCHAR(191) NULL,
    ADD COLUMN `logoLightUrl` VARCHAR(191) NULL;
