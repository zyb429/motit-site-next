-- AlterTable
ALTER TABLE `PrivacyPolicy` MODIFY `id` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `PrivacyPolicyVersion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` JSON NULL,
    `displayMode` VARCHAR(20) NOT NULL DEFAULT 'page',
    `created_by_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `PrivacyPolicyVersion_created_at_idx`(`created_at`),
    INDEX `PrivacyPolicyVersion_created_by_id_idx`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PrivacyPolicyVersion` ADD CONSTRAINT `fk_ppv_author` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
