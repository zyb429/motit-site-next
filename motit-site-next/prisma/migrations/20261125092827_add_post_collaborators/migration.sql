-- CreateTable
CREATE TABLE `post_collaborators` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER UNSIGNED NOT NULL,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'editor',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL,

    INDEX `idx_post_collaborators_post`(`post_id`),
    INDEX `idx_post_collaborators_user`(`user_id`),
    UNIQUE INDEX `idx_post_collaborators_unique`(`post_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_collaborators` ADD CONSTRAINT `fk_post_collaborators_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `post_collaborators` ADD CONSTRAINT `fk_post_collaborators_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
