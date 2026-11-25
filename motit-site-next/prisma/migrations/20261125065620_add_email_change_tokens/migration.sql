-- CreateTable
CREATE TABLE `email_change_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `new_email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `email_change_tokens_uuid_key`(`uuid`),
    UNIQUE INDEX `email_change_tokens_token_key`(`token`),
    INDEX `email_change_tokens_user_uuid_idx`(`user_uuid`),
    INDEX `email_change_tokens_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_change_tokens` ADD CONSTRAINT `email_change_tokens_user_uuid_fkey` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
