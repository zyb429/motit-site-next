-- CreateTable
CREATE TABLE `ticket_status_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `ticket_uuid` CHAR(36) NOT NULL,
    `status_uuid` CHAR(36) NULL,
    `old_status_uuid` CHAR(36) NULL,
    `changed_by_uuid` CHAR(36) NULL,
    `comment` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_ticket_status_history_uuid`(`uuid`),
    INDEX `idx_tsh_ticket_created`(`ticket_uuid`, `created_at`),
    INDEX `idx_tsh_user`(`changed_by_uuid`),
    INDEX `idx_tsh_status`(`status_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `kind` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `direct_key` VARCHAR(80) NULL,
    `ticket_uuid` CHAR(36) NULL,
    `created_by_uuid` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_message_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `idx_chats_uuid`(`uuid`),
    UNIQUE INDEX `idx_chats_direct_key`(`direct_key`),
    UNIQUE INDEX `idx_chats_ticket_unique`(`ticket_uuid`),
    INDEX `idx_chats_kind`(`kind`),
    INDEX `idx_chats_last_message`(`last_message_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_members` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `chat_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'member',
    `joined_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `last_read_at` TIMESTAMP(0) NULL,
    `last_read_message_uuid` CHAR(36) NULL,
    `unread_count` INTEGER NOT NULL DEFAULT 0,
    `is_muted` BOOLEAN NOT NULL DEFAULT false,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `idx_chat_members_uuid`(`uuid`),
    INDEX `idx_chat_members_user`(`user_uuid`),
    INDEX `idx_chat_members_chat`(`chat_uuid`),
    UNIQUE INDEX `idx_chat_members_unique`(`chat_uuid`, `user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `chat_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NULL,
    `kind` VARCHAR(20) NOT NULL DEFAULT 'text',
    `content` TEXT NOT NULL,
    `reply_to_uuid` CHAR(36) NULL,
    `edited_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_chat_messages_uuid`(`uuid`),
    INDEX `idx_chat_messages_chat_created`(`chat_uuid`, `created_at`),
    INDEX `idx_chat_messages_user`(`user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_attachments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `message_uuid` CHAR(36) NOT NULL,
    `file_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_chat_attachments_uuid`(`uuid`),
    INDEX `idx_chat_attachments_message`(`message_uuid`),
    INDEX `idx_chat_attachments_file`(`file_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_reactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `message_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `emoji` VARCHAR(10) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_chat_reactions_message`(`message_uuid`),
    UNIQUE INDEX `idx_chat_reactions_unique`(`message_uuid`, `user_uuid`, `emoji`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_read_receipts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `message_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `read_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_chat_read_receipts_user`(`user_uuid`, `read_at`),
    UNIQUE INDEX `idx_chat_read_receipts_unique`(`message_uuid`, `user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ticket_status_history` ADD CONSTRAINT `fk_tsh_ticket` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_status_history` ADD CONSTRAINT `fk_tsh_status` FOREIGN KEY (`status_uuid`) REFERENCES `statuses`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_status_history` ADD CONSTRAINT `fk_tsh_old_status` FOREIGN KEY (`old_status_uuid`) REFERENCES `statuses`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_status_history` ADD CONSTRAINT `fk_tsh_user` FOREIGN KEY (`changed_by_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `fk_chats_ticket` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `fk_chats_creator` FOREIGN KEY (`created_by_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_members` ADD CONSTRAINT `fk_chat_members_chat` FOREIGN KEY (`chat_uuid`) REFERENCES `chats`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_members` ADD CONSTRAINT `fk_chat_members_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `fk_chat_messages_chat` FOREIGN KEY (`chat_uuid`) REFERENCES `chats`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `fk_chat_messages_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `fk_chat_messages_reply` FOREIGN KEY (`reply_to_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_attachments` ADD CONSTRAINT `fk_chat_attachments_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_attachments` ADD CONSTRAINT `fk_chat_attachments_file` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_reactions` ADD CONSTRAINT `fk_chat_reactions_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_reactions` ADD CONSTRAINT `fk_chat_reactions_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_read_receipts` ADD CONSTRAINT `fk_chat_read_receipts_message` FOREIGN KEY (`message_uuid`) REFERENCES `chat_messages`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chat_read_receipts` ADD CONSTRAINT `fk_chat_read_receipts_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

