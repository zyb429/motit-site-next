-- CreateTable
CREATE TABLE `chat_message_deletions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `message_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_chat_message_deletions_uuid`(`uuid`),
    INDEX `idx_cmd_user`(`user_uuid`),
    INDEX `idx_cmd_message`(`message_uuid`),
    UNIQUE INDEX `idx_cmd_unique`(`message_uuid`, `user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_message_deletions` ADD CONSTRAINT `fk_cmd_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_message_deletions` ADD CONSTRAINT `fk_cmd_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

