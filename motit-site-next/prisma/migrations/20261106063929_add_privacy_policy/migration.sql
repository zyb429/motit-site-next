-- CreateTable
CREATE TABLE `PrivacyPolicy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` JSON NULL,
    `displayMode` VARCHAR(191) NOT NULL DEFAULT 'page',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
