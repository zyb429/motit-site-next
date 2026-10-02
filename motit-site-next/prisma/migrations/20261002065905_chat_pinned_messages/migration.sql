-- CreateTable
CREATE TABLE `chat_pinned_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `chat_uuid` CHAR(36) NOT NULL,
    `message_uuid` CHAR(36) NOT NULL,
    `pinned_by_uuid` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_chat_pinned_messages_uuid`(`uuid`),
    INDEX `idx_cpm_chat`(`chat_uuid`),
    INDEX `idx_cpm_message`(`message_uuid`),
    UNIQUE INDEX `idx_cpm_unique`(`chat_uuid`, `message_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_pinned_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `chat_uuid` CHAR(36) NOT NULL,
    `message_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_user_pinned_messages_uuid`(`uuid`),
    INDEX `idx_upm_chat_user`(`chat_uuid`, `user_uuid`),
    INDEX `idx_upm_message`(`message_uuid`),
    UNIQUE INDEX `idx_upm_unique`(`chat_uuid`, `message_uuid`, `user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chat_pinned_messages` ADD CONSTRAINT `fk_cpm_chat` FOREIGN KEY (`chat_uuid`) REFERENCES `chats`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_pinned_messages` ADD CONSTRAINT `fk_cpm_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_pinned_messages` ADD CONSTRAINT `fk_cpm_user` FOREIGN KEY (`pinned_by_uuid`) REFERENCES `users`(`uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_pinned_messages` ADD CONSTRAINT `fk_upm_chat` FOREIGN KEY (`chat_uuid`) REFERENCES `chats`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_pinned_messages` ADD CONSTRAINT `fk_upm_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_pinned_messages` ADD CONSTRAINT `fk_upm_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;
