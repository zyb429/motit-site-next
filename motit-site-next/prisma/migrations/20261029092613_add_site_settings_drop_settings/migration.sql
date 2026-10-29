/*
  Warnings:

  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `settings`;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Motit',
    `description` TEXT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'ru',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Europe/Minsk',
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `workHours` VARCHAR(191) NULL,
    `socialLinks` JSON NULL,
    `emailFromName` VARCHAR(191) NULL,
    `emailFromEmail` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `seoKeywords` TEXT NULL,
    `ogImageUrl` VARCHAR(191) NULL,
    `robots` VARCHAR(191) NULL DEFAULT 'index,follow',
    `analyticsGaId` VARCHAR(191) NULL,
    `analyticsYmId` VARCHAR(191) NULL,
    `notificationEmails` JSON NULL,
    `logoUrl` VARCHAR(191) NULL,
    `faviconUrl` VARCHAR(191) NULL,
    `accentColor` VARCHAR(191) NULL DEFAULT '#6366f1',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
