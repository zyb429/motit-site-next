-- AlterTable
ALTER TABLE `chat_members` ADD COLUMN `history_visible_from` TIMESTAMP(0) NULL;
ALTER TABLE `chat_members` ADD COLUMN `hidden_at` TIMESTAMP(0) NULL;
