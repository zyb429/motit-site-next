-- AlterTable
ALTER TABLE `chat_messages` ADD COLUMN `forwarded_from_chat_uuid` CHAR(36) NULL,
    ADD COLUMN `forwarded_from_message_uuid` CHAR(36) NULL,
    ADD COLUMN `forwarded_from_user_uuid` CHAR(36) NULL;

