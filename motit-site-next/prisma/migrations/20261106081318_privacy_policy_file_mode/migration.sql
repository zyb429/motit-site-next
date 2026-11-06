/*
  Warnings:

  - You are about to alter the column `displayMode` on the `PrivacyPolicy` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `PrivacyPolicy` ADD COLUMN `fileId` INTEGER UNSIGNED NULL,
    ADD COLUMN `fileName` VARCHAR(255) NULL,
    MODIFY `displayMode` VARCHAR(20) NOT NULL DEFAULT 'page';

-- AlterTable
ALTER TABLE `PrivacyPolicyVersion` ADD COLUMN `fileId` INTEGER UNSIGNED NULL,
    ADD COLUMN `fileName` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `idx_privacy_policy_file` ON `PrivacyPolicy`(`fileId`);

-- CreateIndex
CREATE INDEX `PrivacyPolicyVersion_displayMode_created_at_idx` ON `PrivacyPolicyVersion`(`displayMode`, `created_at`);

-- AddForeignKey
ALTER TABLE `PrivacyPolicy` ADD CONSTRAINT `fk_privacy_policy_file` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
