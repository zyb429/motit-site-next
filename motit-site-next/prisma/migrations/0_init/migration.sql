-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `document_id` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NULL,
    `description` LONGTEXT NULL,
    `icon` VARCHAR(255) NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    `published_at` DATETIME(6) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,

    UNIQUE INDEX `idx_categories_uuid`(`uuid`),
    UNIQUE INDEX `idx_categories_slug`(`slug`),
    INDEX `idx_categories_document_id`(`document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `title` VARCHAR(255) NOT NULL,
    `issuer_id` BIGINT UNSIGNED NULL,
    `image_url` VARCHAR(500) NULL,
    `issue_date` DATE NULL,
    `expiry_date` DATE NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `order` INTEGER NULL DEFAULT 0,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_certificates_uuid`(`uuid`),
    INDEX `idx_certificates_issuer`(`issuer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client_organizations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_user_uuid` CHAR(36) NOT NULL,
    `organization_uuid` CHAR(36) NOT NULL,
    `role_in_company` VARCHAR(50) NULL DEFAULT 'member',
    `is_primary` BOOLEAN NULL DEFAULT false,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `joined_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_client_org_client`(`client_user_uuid`),
    INDEX `idx_client_org_org`(`organization_uuid`),
    UNIQUE INDEX `idx_client_org_unique`(`client_user_uuid`, `organization_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_uuid` CHAR(36) NOT NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_clients_uuid`(`uuid`),
    UNIQUE INDEX `idx_clients_user_uuid`(`user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `files` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `document_id` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,
    `alternative_text` VARCHAR(255) NULL,
    `caption` VARCHAR(255) NULL,
    `mime` VARCHAR(100) NULL,
    `ext` VARCHAR(20) NULL,
    `size` INTEGER UNSIGNED NULL,
    `url` VARCHAR(500) NOT NULL,
    `preview_url` VARCHAR(500) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `hash` VARCHAR(255) NULL,
    `provider` VARCHAR(50) NULL DEFAULT 's3',
    `folder_path` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_files_uuid`(`uuid`),
    INDEX `idx_files_document_id`(`document_id`),
    INDEX `idx_files_folder`(`folder_path`),
    INDEX `idx_files_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `issuers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `website_url` VARCHAR(255) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_issuers_uuid`(`uuid`),
    UNIQUE INDEX `idx_issuers_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `inn` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_organizations_uuid`(`uuid`),
    INDEX `idx_organizations_inn`(`inn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `sections` JSON NULL,
    `seo_data` JSON NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` VARCHAR(300) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_pages_uuid`(`uuid`),
    UNIQUE INDEX `idx_pages_slug`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partners` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `website_url` VARCHAR(255) NULL,
    `image_url` VARCHAR(500) NULL,
    `order` INTEGER NULL DEFAULT 0,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_partners_uuid`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `document_id` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `slug` VARCHAR(255) NULL,
    `content` JSON NULL,
    `excerpt` LONGTEXT NULL,
    `post_status` VARCHAR(255) NULL DEFAULT 'draft',
    `views` INTEGER NULL DEFAULT 0,
    `is_featured` BOOLEAN NULL DEFAULT false,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` LONGTEXT NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    `published_at` DATETIME(6) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `author_id` INTEGER UNSIGNED NULL,
    `featured_image_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,

    UNIQUE INDEX `idx_posts_slug`(`slug`),
    INDEX `idx_posts_author_id`(`author_id`),
    INDEX `idx_posts_created_by_id`(`created_by_id`),
    INDEX `idx_posts_document_id`(`document_id`),
    INDEX `idx_posts_featured_image_id`(`featured_image_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts_categories_links` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER UNSIGNED NOT NULL,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,

    INDEX `idx_posts_categories_links_category`(`category_id`),
    INDEX `idx_posts_categories_links_post`(`post_id`),
    UNIQUE INDEX `idx_posts_categories_links_unique`(`post_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `priorities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_priorities_uuid`(`uuid`),
    UNIQUE INDEX `idx_priorities_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NULL,
    `description` VARCHAR(255) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_roles_uuid`(`uuid`),
    UNIQUE INDEX `idx_roles_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(255) NOT NULL,
    `value` LONGTEXT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_settings_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `statuses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_final` BOOLEAN NOT NULL DEFAULT false,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_statuses_uuid`(`uuid`),
    UNIQUE INDEX `idx_statuses_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(50) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_ticket_categories_uuid`(`uuid`),
    UNIQUE INDEX `idx_ticket_categories_slug`(`slug`),
    INDEX `idx_ticket_categories_active`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `ticket_uuid` CHAR(36) NOT NULL,
    `user_uuid` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `is_internal` BOOLEAN NULL DEFAULT false,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_ticket_comments_uuid`(`uuid`),
    INDEX `idx_ticket_comments_ticket`(`ticket_uuid`),
    INDEX `idx_ticket_comments_user`(`user_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_attachments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `ticket_uuid` CHAR(36) NOT NULL,
    `comment_uuid` CHAR(36) NULL,
    `file_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_ticket_attachments_uuid`(`uuid`),
    INDEX `idx_ticket_attachments_ticket`(`ticket_uuid`),
    INDEX `idx_ticket_attachments_comment`(`comment_uuid`),
    INDEX `idx_ticket_attachments_file`(`file_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `contact_name` VARCHAR(255) NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(50) NULL,
    `organization_uuid` CHAR(36) NULL,
    `client_uuid` CHAR(36) NULL,
    `assigned_to_uuid` CHAR(36) NULL,
    `status_uuid` CHAR(36) NULL,
    `priority_uuid` CHAR(36) NULL,
    `category_uuid` CHAR(36) NULL,
    `deadline_at` TIMESTAMP(0) NULL,
    `resolved_at` TIMESTAMP(0) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_tickets_uuid`(`uuid`),
    INDEX `idx_tickets_assigned`(`assigned_to_uuid`),
    INDEX `idx_tickets_category`(`category_uuid`),
    INDEX `idx_tickets_client`(`client_uuid`),
    INDEX `idx_tickets_created_at`(`created_at`),
    INDEX `idx_tickets_deadline_at`(`deadline_at`),
    INDEX `idx_tickets_organization`(`organization_uuid`),
    INDEX `idx_tickets_priority`(`priority_uuid`),
    INDEX `idx_tickets_status`(`status_uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL DEFAULT (uuid()),
    `document_id` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `password_hash` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `avatar_id` INTEGER UNSIGNED NULL,
    `bio` LONGTEXT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `last_login` DATETIME(6) NULL,
    `provider` VARCHAR(255) NULL,
    `confirmed` BOOLEAN NULL DEFAULT false,
    `blocked` BOOLEAN NULL DEFAULT false,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_expires` DATETIME(6) NULL,
    `confirmation_token` VARCHAR(255) NULL,
    `created_at` DATETIME(6) NULL,
    `updated_at` DATETIME(6) NULL,
    `published_at` DATETIME(6) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,

    UNIQUE INDEX `idx_users_uuid`(`uuid`),
    UNIQUE INDEX `idx_users_username`(`username`),
    UNIQUE INDEX `idx_users_email`(`email`),
    INDEX `idx_users_avatar_id`(`avatar_id`),
    INDEX `idx_users_document_id`(`document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_role_lnk` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_users_role_lnk_role`(`role_id`),
    UNIQUE INDEX `idx_users_role_lnk_unique`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workers` (
    `user_uuid` CHAR(36) NOT NULL,
    `position` VARCHAR(255) NULL,
    `created_by_id` INTEGER UNSIGNED NULL,
    `updated_by_id` INTEGER UNSIGNED NULL,
    `locale` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`user_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `fk_certificates_issuer` FOREIGN KEY (`issuer_id`) REFERENCES `issuers`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `client_organizations` ADD CONSTRAINT `fk_client_org_client` FOREIGN KEY (`client_user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `client_organizations` ADD CONSTRAINT `fk_client_org_org` FOREIGN KEY (`organization_uuid`) REFERENCES `organizations`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `fk_clients_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `fk_posts_author` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `fk_posts_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `fk_posts_featured_image` FOREIGN KEY (`featured_image_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts_categories_links` ADD CONSTRAINT `fk_posts_categories_links_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `posts_categories_links` ADD CONSTRAINT `fk_posts_categories_links_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `fk_ticket_comments_ticket` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `fk_ticket_comments_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `fk_ticket_attachments_ticket` FOREIGN KEY (`ticket_uuid`) REFERENCES `tickets`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `fk_ticket_attachments_comment` FOREIGN KEY (`comment_uuid`) REFERENCES `ticket_comments`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `fk_ticket_attachments_file` FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_assigned` FOREIGN KEY (`assigned_to_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_category` FOREIGN KEY (`category_uuid`) REFERENCES `ticket_categories`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_client` FOREIGN KEY (`client_uuid`) REFERENCES `users`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_organization` FOREIGN KEY (`organization_uuid`) REFERENCES `organizations`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_priority` FOREIGN KEY (`priority_uuid`) REFERENCES `priorities`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `fk_tickets_status` FOREIGN KEY (`status_uuid`) REFERENCES `statuses`(`uuid`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_avatar` FOREIGN KEY (`avatar_id`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_role_lnk` ADD CONSTRAINT `fk_users_role_lnk_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `users_role_lnk` ADD CONSTRAINT `fk_users_role_lnk_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `workers` ADD CONSTRAINT `fk_workers_user` FOREIGN KEY (`user_uuid`) REFERENCES `users`(`uuid`) ON DELETE CASCADE ON UPDATE NO ACTION;

