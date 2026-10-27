-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `form_data` JSON NULL;

-- CreateTable
CREATE TABLE `ContactFormField` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `placeholder` VARCHAR(255) NULL,
    `options` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `idx_contact_form_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
