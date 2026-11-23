-- CreateTable
CREATE TABLE `Activity` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `actor_uuid` CHAR(36) NULL,
    `target_type` VARCHAR(50) NOT NULL,
    `target_id` VARCHAR(100) NULL,
    `action` VARCHAR(50) NOT NULL,
    `ticket_uuid` CHAR(36) NULL,
    `meta` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_activity_uuid`(`uuid`),
    INDEX `idx_activity_created`(`created_at`),
    INDEX `idx_activity_actor`(`actor_uuid`),
    INDEX `idx_activity_ticket`(`ticket_uuid`),
    INDEX `idx_activity_target`(`target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `fk_activity_actor` FOREIGN KEY (`actor_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Activity` ADD CONSTRAINT `fk_activity_ticket` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;
