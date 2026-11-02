-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `adminLocale` VARCHAR(191) NOT NULL DEFAULT 'ru',
    ADD COLUMN `siteLocale` VARCHAR(191) NOT NULL DEFAULT 'ru';
