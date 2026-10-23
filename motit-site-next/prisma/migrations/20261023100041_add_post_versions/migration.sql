-- CreateTable
CREATE TABLE `PostVersion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NULL,
    `excerpt` LONGTEXT NULL,
    `content` JSON NULL,
    `post_status` VARCHAR(255) NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` LONGTEXT NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `PostVersion_post_id_created_at_idx`(`post_id`, `created_at`),
    INDEX `PostVersion_created_by_id_idx`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostVersion` ADD CONSTRAINT `PostVersion_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostVersion` ADD CONSTRAINT `fk_post_versions_author` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
